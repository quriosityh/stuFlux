import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { getProfile, updateProfile } from './service.js';
import { updateProfileSchema } from './validations.js';
import { AppError } from '../../common/errors.js';

export const getMe = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await getProfile(req.auth!.userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: user });
  }),
];

export const updateMe = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = updateProfileSchema.parse(req.body);
    const updated = await updateProfile(req.auth!.userId, parsed);
    if (!updated) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: updated });
  }),
];
