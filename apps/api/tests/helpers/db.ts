import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import {
  users,
  categories,
  listings,
  conversations,
  messages,
  bookings,
  listingPhotos,
  userVerifications,
} from '../../db/schema.js';

export const resetDb = async () => {
  await db.execute(sql`TRUNCATE TABLE messages, conversations, bookings, listing_photos, listings, user_verifications, users, categories RESTART IDENTITY CASCADE`);
};

export const createUser = async (overrides: Partial<typeof users.$inferInsert> = {}) => {
  const [user] = await db
    .insert(users)
    .values({
      id: overrides.id ?? randomUUID(),
      clerk_user_id: overrides.clerk_user_id ?? `clerk_${randomUUID()}`,
      display_name: overrides.display_name ?? 'Test User',
      city: overrides.city ?? 'Lahore',
      email: overrides.email ?? 'test@example.com',
      avatar_url: overrides.avatar_url ?? null,
    })
    .returning();
  return user;
};

export const createCategory = async (overrides: Partial<typeof categories.$inferInsert> = {}) => {
  const [category] = await db
    .insert(categories)
    .values({
      name: overrides.name ?? 'Electronics',
      slug: overrides.slug ?? `electronics-${randomUUID().slice(0, 8)}`,
      description: overrides.description ?? 'Test category',
      icon: overrides.icon ?? null,
    })
    .returning();
  return category;
};

export const createListing = async (ownerId: string, categoryId: number, overrides: Partial<typeof listings.$inferInsert> = {}) => {
  const [listing] = await db
    .insert(listings)
    .values({
      id: overrides.id ?? randomUUID(),
      owner_id: ownerId,
      title: overrides.title ?? 'Camera',
      description: overrides.description ?? 'A test camera',
      category_id: categoryId,
      daily_rate: overrides.daily_rate ?? 1000,
      city: overrides.city ?? 'Lahore',
      address: overrides.address ?? 'Test address',
      specs: overrides.specs ?? {},
      status: overrides.status ?? 'active',
    })
    .returning();
  return listing;
};

export const createConversation = async (listingId: string, renterId: string, ownerId: string) => {
  const [conv] = await db
    .insert(conversations)
    .values({ listing_id: listingId, renter_id: renterId, owner_id: ownerId })
    .returning();
  return conv;
};

export const createMessage = async (conversationId: string, senderId: string, body: string) => {
  const [msg] = await db
    .insert(messages)
    .values({ conversation_id: conversationId, sender_id: senderId, body })
    .returning();
  return msg;
};

export const findMessages = async (conversationId: string) => {
  return db
    .select()
    .from(messages)
    .where(sql`${messages.conversation_id} = ${conversationId}`);
};

export const findMessageById = async (messageId: string) => {
  const rows = await db
    .select()
    .from(messages)
    .where(sql`${messages.id} = ${messageId}`)
    .limit(1);
  return rows[0] ?? null;
};
