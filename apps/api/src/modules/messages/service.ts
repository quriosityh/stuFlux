import { AppError } from '../../common/errors.js';
import { listingsRepository } from '../listings/infrastructure/repository.js';
import { messagesRepository } from './repository.js';
import { sendMessageSchema, listMessagesSchema } from './validations.js';
import { messageEmitter, isUserConnected } from '../../infra/events/messageEmitter.js';

export const sendMessage = async (payload: unknown, senderId: string) => {
  const data = sendMessageSchema.parse(payload);

  let conversation = null;
  let renterId: string;
  let ownerId: string;
  let receiverId: string;

  if (data.conversation_id) {
    conversation = await messagesRepository.findConversationById(data.conversation_id);
    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    if (conversation.renter_id !== senderId && conversation.owner_id !== senderId) {
      throw new AppError('Not allowed', 403, 'FORBIDDEN');
    }
    renterId = conversation.renter_id;
    ownerId = conversation.owner_id;
    receiverId = senderId === ownerId ? renterId : ownerId;
  } else {
    const listing = await listingsRepository.findById(data.listing_id!);
    if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    if (!listing.owner) throw new AppError('Listing has no owner', 500, 'LISTING_NO_OWNER');
    if (listing.owner.id === senderId) {
      throw new AppError('Owners cannot start conversations with themselves', 400, 'CONVERSATION_NOT_ALLOWED');
    }
    renterId = senderId;
    ownerId = listing.owner.id;
    receiverId = ownerId;
    conversation = await messagesRepository.ensureConversation(data.listing_id!, renterId, ownerId);
  }

  if (!conversation) throw new AppError('Unable to create conversation', 500, 'CONVERSATION_CREATE_FAILED');

  const message = await messagesRepository.addMessage(conversation.id, senderId, data.body.trim());

  // Check if receiver is online via active SSE stream
  if (isUserConnected(conversation.id, receiverId)) {
    await messagesRepository.markDelivered(message.id);
  }

  const eventPayload = { ...message, conversation_id: conversation.id };
  messageEmitter.emit(`conversation:${conversation.id}`, eventPayload);

  return {
    conversation,
    message: eventPayload,
  };
};

export const listConversations = async (userId: string) => {
  return messagesRepository.listConversationsForUser(userId);
};

export const listMessages = async (conversationId: string, query: unknown, userId: string) => {
  const convo = await messagesRepository.findConversationById(conversationId);
  if (!convo) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  if (convo.renter_id !== userId && convo.owner_id !== userId) {
    throw new AppError('Not allowed', 403, 'FORBIDDEN');
  }
  const { limit, offset } = listMessagesSchema.parse(query);
  const msgs = await messagesRepository.getMessages(conversationId, limit, offset);
  await messagesRepository.markConversationRead(conversationId, userId);
  return msgs;
};

export const deleteMessage = async (messageId: string, userId: string) => {
  const msg = await messagesRepository.softDeleteMessage(messageId, userId);
  if (!msg) throw new AppError('Message not found or not owned', 404, 'MESSAGE_NOT_FOUND');
  messageEmitter.emit(`conversation:${msg.conversation_id}`, { ...msg, deleted: true });
  return msg;
};

export const markConversationSeen = async (conversationId: string, userId: string) => {
  const convo = await messagesRepository.findConversationById(conversationId);
  if (!convo) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  if (convo.renter_id !== userId && convo.owner_id !== userId) {
    throw new AppError('Not allowed', 403, 'FORBIDDEN');
  }
  await messagesRepository.markConversationRead(conversationId, userId);
  return { success: true };
};
