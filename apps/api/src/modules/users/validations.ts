import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  area: z.string().min(2).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const completeOnboardingSchema = z.object({
  display_name: z.string().trim().min(2, 'Display name must be at least 2 characters').max(100),
  area: z.string().trim().min(2, 'Please select your area').max(100),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
