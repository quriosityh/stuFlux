import { createClerkClient } from '@clerk/backend';
import { usersRepository } from './repository.js';
import type { UpdateProfileInput } from './validations.js';

const DEFAULT_CITY = 'Unknown';
const DEFAULT_NAME = 'User';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const ensureUserSynced = async (clerkUserId: string) => {
  if (!clerkUserId) return null;

  const existing = await usersRepository.findByClerkId(clerkUserId);

  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const displayName =
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
    clerkUser.username ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    existing?.display_name ||
    DEFAULT_NAME;

  const email = clerkUser.emailAddresses[0]?.emailAddress || existing?.email || null;
  const avatar_url = clerkUser.imageUrl || existing?.avatar_url || null;
  const city = existing?.city || DEFAULT_CITY;

  const user = await usersRepository.upsertFromClerk({
    clerk_user_id: clerkUserId,
    display_name: displayName,
    email,
    avatar_url,
    city,
  });

  return user;
};

export const getProfile = async (clerkUserId: string) => {
  return usersRepository.findByClerkId(clerkUserId);
};

export const updateProfile = async (clerkUserId: string, payload: UpdateProfileInput) => {
  const user = await usersRepository.findByClerkId(clerkUserId);
  if (!user) return null;
  return usersRepository.updateProfile(user.id, payload);
};
