import { Response } from 'express';
import { AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import * as service from './service.js';
import { createReviewSchema, updateReviewSchema, getReviewsQuerySchema, reviewIdSchema } from './validation.js';

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  const validated = createReviewSchema.parse(req.body);
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

  const review = await service.createReview(userId, validated);

  return res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review }
  });
};

export const getReviews = async (req: AuthenticatedRequest, res: Response) => {
  const validated = getReviewsQuerySchema.parse(req.query);
  let result;

  if (validated.listingId) result = await service.getListingReviews(validated);
  else if (validated.targetId || validated.ownerId) result = await service.getUserReviews(validated);
  else return res.status(400).json({ success: false, message: 'Either listingId, targetId, or ownerId must be provided' });

  return res.status(200).json({ success: true, data: result });
};

export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = reviewIdSchema.parse(req.params);
  const validated = updateReviewSchema.parse(req.body);
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

  const review = await service.updateReview(userId, id, validated);
  return res.status(200).json({ success: true, message: 'Review updated successfully', data: { review } });
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = reviewIdSchema.parse(req.params);
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

  const result = await service.deleteReview(userId, id);
  return res.status(200).json({ success: true, message: result.message });
};

export const getReviewById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = reviewIdSchema.parse(req.params);
  const review = await service.getReviewById(id);
  return res.status(200).json({ success: true, data: { review } });
};
