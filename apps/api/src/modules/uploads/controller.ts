import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { getUploadSignature, completeUpload } from './service.js';
import { Response } from 'express';

export const getSignature = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = await getUploadSignature(req.auth!.userId);
    res.json(payload);
  }),
];

export const completeUploadHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = await completeUpload(req.auth!.userId, req.body);
    res.json(payload);
  }),
];
