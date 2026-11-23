import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { sendMessage, listConversations, listMessages, deleteMessage, markConversationSeen, getConversationByListing } from './service.js';
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

export const markConversationSeenHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const data = await markConversationSeen(id, req.auth!.userId);
    res.json({ data });
  }),
];

export const getConversationByListingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { listingId } = req.params;
    const data = await getConversationByListing(listingId, req.auth!.userId);
    // 200 with null data = no thread yet (caller should start one)
    res.json({ data });
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
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx: disable proxy buffering
    res.flushHeaders?.();

    // Disable Nagle's algorithm so each event is sent immediately
    const socket = (req.socket ?? (req as any).connection);
    if (socket?.setNoDelay) socket.setNoDelay(true);

    // Track active stream for delivery semantics
    trackStream(id, userId);

    // Mark any pending undelivered messages as delivered upon connection
    void messagesRepository.markUndeliveredAsDelivered(id, userId);

    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 20000);

    const listener = (payload: any) => {
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        // Force flush if available (e.g. compression middleware wraps write)
        if (typeof (res as any).flush === 'function') (res as any).flush();
      } catch {
        // Connection already closed
      }
    };

    messageEmitter.on(`conversation:${id}`, listener);

    req.on('close', () => {
      clearInterval(heartbeat);
      messageEmitter.off(`conversation:${id}`, listener);
      untrackStream(id, userId);
    });
  }),
];
