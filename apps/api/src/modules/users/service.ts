import { createClerkClient } from '@clerk/backend';
import { AppError } from '../../common/errors.js';
import { usersRepository } from './repository.js';
import type { SyncPhoneVerificationInput } from './validations.js';
import type { CompleteOnboardingInput, UpdateProfileInput } from './validations.js';

const DEFAULT_AREA = 'johar-town';
const DEFAULT_NAME = 'User';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// ── In-process user cache to avoid Neon cold-start on every request ──────────
const USER_CACHE = new Map<string, { user: any; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

const getCachedUser = (clerkUserId: string) => {
  const entry = USER_CACHE.get(clerkUserId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    USER_CACHE.delete(clerkUserId);
    return null;
  }
  return entry.user;
};

const setCachedUser = (clerkUserId: string, user: any) => {
  USER_CACHE.set(clerkUserId, { user, expiresAt: Date.now() + CACHE_TTL_MS });
};
// ─────────────────────────────────────────────────────────────────────────────

export const ensureUserSynced = async (clerkUserId: string) => {
  if (!clerkUserId) return null;

  // 1. Return from in-process cache — zero DB latency for warm requests
  const cached = getCachedUser(clerkUserId);
  if (cached) return cached;

  // 2. Check DB (Neon cold-start only happens here, once per 60s)
  const existing = await usersRepository.findByClerkId(clerkUserId);
  if (existing) {
    setCachedUser(clerkUserId, existing);
    return existing;
  }

  // 3. New user — fetch from Clerk and upsert
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const displayName =
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
    clerkUser.username ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    DEFAULT_NAME;

  const email = clerkUser.emailAddresses[0]?.emailAddress || null;
  const avatar_url = clerkUser.imageUrl || null;

  const user = await usersRepository.upsertFromClerk({
    clerk_user_id: clerkUserId,
    display_name: displayName,
    email,
    avatar_url,
    area: DEFAULT_AREA,
  });

  if (user) {
    setCachedUser(clerkUserId, user);
  }

  return user;
};

/**
 * Get own profile with stats + phone verification (3 DB calls total, 2 in parallel)
 * The user row is passed in from auth middleware — no redundant findById call.
 */
export const getProfile = async (userRow: any) => {
  const [phoneVerified, stats] = await Promise.all([
    usersRepository.isPhoneVerified(userRow.id),
    usersRepository.getUserStats(userRow.id),
  ]);

  return {
    ...userRow,
    phone_verified: phoneVerified,
    stats,
  };
};

/** Confirms the phone belongs to the authenticated Clerk user before persisting its verified state. */
export const syncPhoneVerification = async (
  userRow: { id: string; clerk_user_id: string },
  input: SyncPhoneVerificationInput
) => {
  const clerkUser = await clerkClient.users.getUser(userRow.clerk_user_id);
  const phone = clerkUser.phoneNumbers.find((item) => item.id === input.phone_number_id);

  if (!phone || phone.verification?.status !== 'verified') {
    throw new AppError('Phone number has not been verified', 400, 'PHONE_NOT_VERIFIED');
  }

  await usersRepository.setPhoneVerified(userRow.id);
  return { phone_verified: true };
};

/**
 * Public profile — strips private financials (earned/pending amounts)
 */
export const getPublicProfile = async (targetUserId: string) => {
  const [user, phoneVerified, stats] = await Promise.all([
    usersRepository.findById(targetUserId),
    usersRepository.isPhoneVerified(targetUserId),
    usersRepository.getUserStats(targetUserId),
  ]);

  if (!user) return null;

  // Strip private financial fields — renter should not see host's earnings
  const { total_earned: _te, pending_earnings: _pe, ...publicStats } = stats;

  return {
    id:           user.id,
    display_name: user.display_name,
    area:         user.area,
    avatar_url:   user.avatar_url,
    created_at:   user.created_at,
    phone_verified: phoneVerified,
    stats:        publicStats,
  };
};

export const updateProfile = async (dbUserId: string, payload: UpdateProfileInput) => {
  return usersRepository.updateProfile(dbUserId, payload);
};

/**
 * Marks onboarding complete only alongside the required profile data. Keeping
 * this separate from the regular profile update prevents a client from setting
 * an arbitrary `onboarded: true` flag.
 */
export const completeOnboarding = async (dbUserId: string, payload: CompleteOnboardingInput) => {
  return usersRepository.updateProfile(dbUserId, { ...payload, onboarded: true });
};
