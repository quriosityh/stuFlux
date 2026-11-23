import { z } from 'zod';

/**
 * Sanitize text input to prevent XSS attacks
 */
const sanitizeText = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Category ratings schema
 * Optional, each must be 1–5 if provided
 */
const categoryRatingsSchema = z
  .object({
    cleanliness: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    accuracy: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
  })
  .optional();

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
  bookingId: z.string().uuid({ message: 'Invalid booking ID' }),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .max(2000)
    .transform(sanitizeText)
    .optional(),
  categoryRatings: categoryRatingsSchema,
});

/**
 * Update review schema
 */
export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z
      .string()
      .max(2000)
      .transform(sanitizeText)
      .optional(),
    categoryRatings: categoryRatingsSchema,
  })
  .refine(
    (data) =>
      data.rating !== undefined ||
      data.comment !== undefined ||
      data.categoryRatings !== undefined,
    {
      message:
        'At least one field (rating, comment, or categoryRatings) must be provided',
    }
  );

/**
 * Query parameters for listing/owner reviews
 */
export const getReviewsQuerySchema = z
  .object({
    listingId: z.string().uuid().optional(),
    targetId: z.string().uuid().optional(),
    ownerId: z.string().uuid().optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    sort: z.enum(['recent', 'highest', 'lowest']).default('recent'),
    category: z
      .enum(['cleanliness', 'communication', 'accuracy', 'value'])
      .optional(),
    role: z.enum(['as_lender', 'as_renter', 'all']).optional(),
  })
  .refine((data) => data.listingId || data.targetId || data.ownerId, {
    message: 'Either listingId, targetId, or ownerId must be provided',
  });

/**
 * Review ID params
 */
export const reviewIdSchema = z.object({
  id: z.string().uuid({ message: 'Invalid review ID' }),
});

// Types
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
export type ReviewIdParams = z.infer<typeof reviewIdSchema>;
