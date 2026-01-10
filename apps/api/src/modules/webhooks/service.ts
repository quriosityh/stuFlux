import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { ensureUserSynced } from '../users/service.js';
import { AppError } from '../../common/errors.js';

// Note: For proper security, verify the webhook signature (Clerk -> Svix).
// This handler assumes trusted environment; add signature verification later.
export const handleClerkWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body as any;
  const type = event?.type;
  const userId = event?.data?.id;

  if (!type || !userId) {
    throw new AppError('Invalid webhook payload', 400, 'WEBHOOK_INVALID');
  }

  if (type === 'user.created' || type === 'user.updated') {
    await ensureUserSynced(userId);
  }

  res.status(200).json({ received: true });
});
