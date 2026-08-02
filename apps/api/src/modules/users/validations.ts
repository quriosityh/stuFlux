import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  area: z.string().min(2).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateVerificationSchema = z.object({
  phone_verified: z.boolean().optional(),
  verification_level: z.string().optional(),
});

export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
