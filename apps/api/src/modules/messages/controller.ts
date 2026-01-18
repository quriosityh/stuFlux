import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { sendMessage, listConversations, listMessages, deleteMessage, markConversationSeen } from './service.js';
import { messageEmitter, trackStream, untrackStream } from '../../infra/events/messageEmitter.js';
import { messagesRepository } from './repository.js';
import { AppError } from '../../common/errors.js';

export const sendMessageHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await sendMessage(req.body, req.auth!.userId);
    res.status(201).json({ data: result.message });
  }),
];

export const listConversationsHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await listConversations(req.auth!.userId);
    res.json({ data });
  }),
];

export const listMessagesHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const data = await listMessages(id, req.query, req.auth!.userId);
    res.json({ data });
  }),
];

export const deleteMessageHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const msg = await deleteMessage(id, req.auth!.userId);
    res.json({ data: msg });
  }),
];

export const markSeenHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await markConversationSeen(id, req.auth!.userId);
    res.json({ data: result });
  }),
];

export const streamConversationHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.auth!.userId;
    const convo = await messagesRepository.findConversationById(id);
    if (!convo) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    if (convo.renter_id !== userId && convo.owner_id !== userId) {
      throw new AppError('Not allowed', 403, 'FORBIDDEN');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Track this user as connected to this conversation
    trackStream(id, userId);

    // Mark any undelivered messages as delivered (retroactive delivery)
    const undelivered = await messagesRepository.getUndeliveredMessages(id, userId);
    if (undelivered.length > 0) {
      await messagesRepository.markDeliveredBulk(undelivered.map(m => m.id));
    }

    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 25000);

    const listener = (payload: any) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    messageEmitter.on(`conversation:${id}`, listener);

    req.on('close', () => {
      clearInterval(heartbeat);
      messageEmitter.off(`conversation:${id}`, listener);
      untrackStream(id, userId);
    });
  }),
];
