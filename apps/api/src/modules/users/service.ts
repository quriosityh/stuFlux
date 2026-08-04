import { createClerkClient } from '@clerk/backend';
import { usersRepository } from './repository.js';
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
  const area = DEFAULT_AREA;

  const user = await usersRepository.upsertFromClerk({
    clerk_user_id: clerkUserId,
    display_name: displayName,
    email,
    avatar_url,
    area,
  });

  if (user) {
    setCachedUser(clerkUserId, user);
  }

  return user;
};

export const getProfile = async (dbUserId: string) => {
  const user = await usersRepository.findById(dbUserId);
  if (!user) return null;

  const stats = await usersRepository.getUserStats(dbUserId);

  return {
    ...user,
    stats,
  };
};

export const getPublicProfile = async (targetUserId: string) => {
  const user = await usersRepository.findById(targetUserId);
  if (!user) return null;

  const stats = await usersRepository.getUserStats(targetUserId);

  // Strip private metrics (total_earned, pending_earnings) for public view
  const { total_earned, pending_earnings, ...publicStats } = stats;

  return {
    id: user.id,
    display_name: user.display_name,
    area: user.area,
    avatar_url: user.avatar_url,
    stats: publicStats,
    created_at: user.created_at,
  };
};

export const updateProfile = async (dbUserId: string, payload: UpdateProfileInput) => {
  return usersRepository.updateProfile(dbUserId, payload);
};

export const completeOnboarding = async (dbUserId: string, clerkUserId: string, payload: CompleteOnboardingInput) => {
  const user = await usersRepository.completeOnboarding(dbUserId, payload);
  if (!user) return null;

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { onboarding_completed: true },
  });
  setCachedUser(clerkUserId, user);
  return user;
};
