import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { getProfile, getPublicProfile, syncPhoneVerification, updateProfile } from './service.js';
import { syncPhoneVerificationSchema, updateProfileSchema } from './validations.js';
import { AppError } from '../../common/errors.js';

export const getMe = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // auth.userRow already set by requireAuth middleware — no extra DB lookup
    const profile = await getProfile(req.auth!.userRow);
    res.json({ data: profile });
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

export const syncMyPhoneVerification = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = syncPhoneVerificationSchema.parse(req.body);
    const result = await syncPhoneVerification(req.auth!.userRow, input);
    res.json({ data: result });
  }),
];

export const getUserById = [
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    const user = await getPublicProfile(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json({ data: user });
  }),
];
