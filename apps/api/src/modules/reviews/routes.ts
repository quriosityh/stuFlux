import { Router } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, optionalAuth } from '../../infra/http/middleware/auth.js';
import * as controller from './controller.js';

const router:Router = Router();

router.post('/', requireAuth, asyncHandler(controller.createReview));
router.get('/', optionalAuth, asyncHandler(controller.getReviews));
router.get('/:id', optionalAuth, asyncHandler(controller.getReviewById));
router.put('/:id', requireAuth, asyncHandler(controller.updateReview));
router.delete('/:id', requireAuth, asyncHandler(controller.deleteReview));

export default router;
