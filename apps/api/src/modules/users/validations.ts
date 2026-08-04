import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  area: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().max(1000).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
