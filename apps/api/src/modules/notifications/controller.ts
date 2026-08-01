import { Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import {
  notificationEmitter,
  trackUserStream,
  untrackUserStream,
  type NotificationEvent,
} from '../../infra/events/notificationEmitter.js';

export const streamNotificationsHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.auth!.userId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    trackUserStream(userId);

    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 25_000);

    const listener = (payload: NotificationEvent) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    notificationEmitter.on(`user:${userId}`, listener);

    req.on('close', () => {
      clearInterval(heartbeat);
      notificationEmitter.off(`user:${userId}`, listener);
      untrackUserStream(userId);
    });
  }),
];
