import { z } from 'zod';

export const photoSchema = z.object({
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  size_kb: z.number().int().positive().optional(),
  mime_type: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
  is_primary: z.boolean().optional(),
});

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category_id: z.number().int().positive(),
  daily_rate: z.number().int().positive(),
  area: z.string().min(2).max(100),
  condition: z.enum(["like_new", "good", "fair", "well_used"]).optional(),
  rental_rules: z.string().max(1000).optional(),
  specs: z.record(z.string(), z.any()).default({}),
  min_rental_days: z.number().int().min(1).default(1),
  max_rental_days: z.number().int().min(1).default(30),
  delivery_available: z.boolean().default(false),
  delivery_fee: z.number().int().min(0).default(0),
  security_deposit: z.number().int().min(0).default(0),
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  photos: z.array(photoSchema).min(0).max(5).default([]),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
  photos: z.array(photoSchema).min(0).max(5).optional(),
});

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
  .optional();

export const listFiltersSchema = z.object({
  q: z.string().max(200).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  area: z.string().min(2).max(100).optional(),
  delivery_available: z.preprocess(
    (val) => (val === 'true' || val === '1' ? true : val === 'false' || val === '0' ? false : undefined),
    z.boolean().optional()
  ),
  min_rate: z.coerce.number().int().positive().optional(),
  max_rate: z.coerce.number().int().positive().optional(),
  start_date: dateString,
  end_date: dateString,
  sort: z.enum(["popular", "newest", "rate_asc", "rate_desc"]).default("popular"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).superRefine((data, ctx) => {
  // Enforce: both dates must be provided together or neither
  if ((data.start_date && !data.end_date) || (!data.start_date && data.end_date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'start_date and end_date must both be provided together',
      path: [data.start_date ? 'end_date' : 'start_date'],
    });
  }
  // Enforce: start must be before end
  if (data.start_date && data.end_date && data.start_date >= data.end_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'start_date must be before end_date',
      path: ['start_date'],
    });
  }
});

export type PhotoInput = z.infer<typeof photoSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListFiltersInput = z.infer<typeof listFiltersSchema>;
