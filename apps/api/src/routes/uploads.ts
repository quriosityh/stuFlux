import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';

const router: Router = Router();

// POST /api/v1/uploads/signature - Get Cloudinary signature (auth required)**Clerk HTTP Client for API Calls** (apps/web/src/lib/api-client.ts)
router.post('/signature', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // TODO: Implement in Day 10-11 (Cloudinary integration)
  res.json({
    message: 'Upload signature endpoint ready - will be implemented with Cloudinary in Day 10-11',
    userId: req.auth!.userId,
    timestamp: new Date().toISOString()
  });
}));

// POST /api/v1/uploads/complete - Complete upload process (auth required)
router.post('/complete', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // TODO: Implement in Day 10-11
  res.json({
    message: 'Upload completion endpoint ready',
    userId: req.auth!.userId
  });
}));

export default router;