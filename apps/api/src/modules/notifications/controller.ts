import { Response } from 'express';
import { verifyToken } from '@clerk/backend';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { ensureUserSynced } from '../users/service.js';
import { AppError } from '../../common/errors.js';
import {
  notificationEmitter,
  trackUserStream,
  untrackUserStream,
  type NotificationEvent,
} from '../../infra/events/notificationEmitter.js';
import type { Request } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from './service.js';

/**
 * SSE handler — GET /notifications/stream
 *
 * Because browsers cannot set custom headers on EventSource, we accept the
 * Clerk JWT in the Authorization header **or** as ?token= query param.
 */
export const streamNotificationsHandler = [
  asyncHandler(async (req: Request, res: Response) => {
    // Resolve token from Authorization header or query param
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

    if (!token) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    const user = await ensureUserSynced(payload.sub);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const userId = user.id;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    trackUserStream(userId);

    // Keep-alive heartbeat every 25 s
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

export const listNotificationsHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ data: await getNotifications(req.auth!.userId) });
  }),
];

export const markNotificationReadHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const notification = await markNotificationRead(req.auth!.userId, req.params.id);
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    res.json({ data: notification });
  }),
];

export const markAllNotificationsReadHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await markAllNotificationsRead(req.auth!.userId);
    res.status(204).end();
  }),
];
