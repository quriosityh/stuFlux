import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { completeOnboarding, getProfile, getPublicProfile, updateProfile } from './service.js';
import { completeOnboardingSchema, updateProfileSchema } from './validations.js';
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
    const updated = await updateProfile(req.auth!.userId, req.auth!.clerkUserId, parsed);
    if (!updated) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: updated });
  }),
];

export const completeMyOnboarding = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = completeOnboardingSchema.parse(req.body);
    const updated = await completeOnboarding(req.auth!.userId, req.auth!.clerkUserId, parsed);
    if (!updated) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: updated });
  }),
];

export const getUserById = [
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    const user = await getPublicProfile(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: user });
  }),
];
