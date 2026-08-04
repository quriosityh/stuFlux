import { AppError } from '../../common/errors.js';
import { listingsRepository } from '../listings/infrastructure/repository.js';
import { messagesRepository } from './repository.js';
import { sendMessageSchema, listMessagesSchema } from './validations.js';
import { messageEmitter, isUserConnected } from '../../infra/events/messageEmitter.js';
import { type NotificationEvent } from '../../infra/events/notificationEmitter.js';
import { publishNotification } from '../notifications/service.js';
import { usersRepository } from '../users/repository.js';
import { sendPushToUser } from '../../infra/push/sender.js';

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------
// Two entry paths:
//
//   A) conversation_id supplied → existing thread, just append the message.
//   B) listing_id supplied (no conversation yet) → the renter is initiating
//      an INQUIRY from the listing page. Ensure an inquiry thread exists
//      (idempotent) then append the first message.
// ---------------------------------------------------------------------------

export const sendMessage = async (payload: unknown, senderId: string) => {
  const data = sendMessageSchema.parse(payload);

  let conversation: Awaited<ReturnType<typeof messagesRepository.findConversationById>>;
  let renterId: string;
  let ownerId: string;

  if (data.conversation_id) {
    // ── Path A: reply to an existing thread ──────────────────────────────
    conversation = await messagesRepository.findConversationById(data.conversation_id);
    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    if (conversation.renter_id !== senderId && conversation.owner_id !== senderId) {
      throw new AppError('Not allowed', 403, 'FORBIDDEN');
    }
    renterId = conversation.renter_id;
    ownerId  = conversation.owner_id;
  } else {
    // ── Path B: new inquiry from listing page ────────────────────────────
    const listing = await listingsRepository.findById(data.listing_id!);
    if (!listing)        throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    if (!listing.owner)  throw new AppError('Listing has no owner', 500, 'LISTING_NO_OWNER');
    if (listing.owner.id === senderId) {
      throw new AppError('Owners cannot start conversations with themselves', 400, 'CONVERSATION_NOT_ALLOWED');
    }

    renterId = senderId;
    ownerId  = listing.owner.id;

    // ensureInquiryConversation is idempotent — safe to call on every message
    // before a booking is created (the partial unique index deduplicates).
    conversation = await messagesRepository.ensureInquiryConversation(
      data.listing_id!,
      renterId,
      ownerId,
    );
  }

  if (!conversation) throw new AppError('Unable to create conversation', 500, 'CONVERSATION_CREATE_FAILED');

  const message = await messagesRepository.addMessage(conversation.id, senderId, data.body.trim());

  // Delivery semantics — mark delivered immediately if recipient is connected
  const recipientId = senderId === renterId ? ownerId : renterId;
  let deliveredAt: Date | null = null;
  if (isUserConnected(conversation.id, recipientId)) {
    deliveredAt = new Date();
    await messagesRepository.markDelivered(message.id, deliveredAt);
  }

  const eventPayload = {
    ...message,
    conversation_id: conversation.id,
    delivered_at: deliveredAt ?? message.delivered_at,
  };
  messageEmitter.emit(`conversation:${conversation.id}`, eventPayload);

  const senderName = await usersRepository.findDisplayName(senderId);
  void publishNotification(recipientId, {
    type: 'new_message',
    conversationId: conversation.id,
    senderName: senderName ?? 'Someone',
    preview: data.body.trim().slice(0, 60),
  } satisfies NotificationEvent);
  void sendPushToUser(recipientId, {
    type: 'new_message',
    title: `New message from ${senderName ?? 'someone'}`,
    body: data.body.trim().slice(0, 120),
    url: `/messages?conversation=${conversation.id}`,
  });

  return { conversation, message: eventPayload };
};

// ---------------------------------------------------------------------------
// listConversations
// ---------------------------------------------------------------------------

export const listConversations = async (userId: string) => {
  return messagesRepository.listConversationsForUser(userId);
};

// ---------------------------------------------------------------------------
// listMessages
// ---------------------------------------------------------------------------

export const listMessages = async (conversationId: string, query: unknown, userId: string) => {
  const convo = await messagesRepository.findConversationById(conversationId);
  if (!convo) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  if (convo.renter_id !== userId && convo.owner_id !== userId) {
    throw new AppError('Not allowed', 403, 'FORBIDDEN');
  }
  const { limit, offset } = listMessagesSchema.parse(query);
  const msgs = await messagesRepository.getMessages(conversationId, limit, offset);
  await messagesRepository.markConversationRead(conversationId, userId);
  // Annotate each message so the client knows which side to render it on.
  // This avoids the Clerk ID vs internal UUID mismatch on the frontend.
  return msgs.map((m) => ({ ...m, viewer_is_sender: m.sender_id === userId }));
};

// ---------------------------------------------------------------------------
// deleteMessage
// ---------------------------------------------------------------------------

export const deleteMessage = async (messageId: string, userId: string) => {
  const msg = await messagesRepository.softDeleteMessage(messageId, userId);
  if (!msg) throw new AppError('Message not found or not owned', 404, 'MESSAGE_NOT_FOUND');
  messageEmitter.emit(`conversation:${msg.conversation_id}`, { ...msg, deleted: true });
  return msg;
};

// ---------------------------------------------------------------------------
// markConversationSeen
// ---------------------------------------------------------------------------

export const markConversationSeen = async (conversationId: string, userId: string) => {
  const convo = await messagesRepository.findConversationById(conversationId);
  if (!convo) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  if (convo.renter_id !== userId && convo.owner_id !== userId) {
    throw new AppError('Not allowed', 403, 'FORBIDDEN');
  }
  await messagesRepository.markConversationRead(conversationId, userId);
  return { conversation_id: conversationId, status: 'seen' } as const;
};
