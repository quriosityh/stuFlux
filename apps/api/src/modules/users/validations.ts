import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  area: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().max(1000).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Profile fields required before an account can use authenticated features. */
export const completeOnboardingSchema = z.object({
  display_name: z.string().trim().min(2).max(100),
  area: z.string().trim().min(2).max(100),
  avatar_url: z.string().url().max(1000),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

export const syncPhoneVerificationSchema = z.object({
  phone_number_id: z.string().min(1).max(100),
});

export type SyncPhoneVerificationInput = z.infer<typeof syncPhoneVerificationSchema>;
