import { Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { subscribeToPush, unsubscribeFromPush } from './service.js';

export const subscribePushHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await subscribeToPush(req.auth!.userId, req.body);
    res.json(data);
  }),
];

export const unsubscribePushHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await unsubscribeFromPush(req.auth!.userId, req.body);
    res.json(data);
  }),
];
