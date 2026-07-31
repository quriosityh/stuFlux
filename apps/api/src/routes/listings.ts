import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errors.js';

const router :Router = Router();

// Validation schemas
const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category_id: z.number().int().positive(),
  daily_rate: z.number().int().positive(),
  city: z.string().min(2).max(100),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  min_rental_days: z.number().int().positive().default(1),
  max_rental_days: z.number().int().positive().default(30),
  delivery_available: z.boolean().default(false),
  delivery_fee: z.number().int().min(0).default(0),
  security_deposit: z.number().int().min(0).default(0),
  specs: z.record(z.string(), z.any()).default({})
});

// GET /api/v1/listings - Browse listings (public)
router.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // TODO: Implement in Day 7 (Database + Schema)
  res.json({
    message: 'Listings endpoint ready - will be implemented with database in Day 7',
    authenticated: !!req.auth,
    timestamp: new Date().toISOString()
  });
}));

// GET /api/v1/listings/:id - Get single listing (public)
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  
  // TODO: Implement in Day 7
  res.json({
    message: `Listing ${id} endpoint ready - will be implemented with database`,
    id,
    authenticated: !!req.auth
  });
}));

// POST /api/v1/listings - Create listing (auth required)
router.post('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createListingSchema.parse(req.body);
  
  // TODO: Implement in Day 7
  res.status(201).json({
    message: 'Create listing endpoint ready',
    userId: req.auth!.userId,
    data: validatedData
  });
}));

// PUT /api/v1/listings/:id - Update listing (auth required)
router.put('/:id', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = createListingSchema.partial().parse(req.body);
  
  // TODO: Implement in Day 7
  res.json({
    message: `Update listing ${id} endpoint ready`,
    userId: req.auth!.userId,
    data: validatedData
  });
}));

export default router;