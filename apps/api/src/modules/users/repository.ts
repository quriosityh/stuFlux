import { db } from '../../infra/db/client.js';
import { users } from '../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import type { UpdateProfileInput } from './validations.js';

export const usersRepository = {
  async findByClerkId(clerkUserId: string) {
    const [row] = await db.select().from(users).where(eq(users.clerk_user_id, clerkUserId));
    return row ?? null;
  },

  async findById(id: string) {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ?? null;
  },

  async upsertFromClerk(params: {
    clerk_user_id: string;
    display_name: string;
    email?: string | null;
    avatar_url?: string | null;
    area?: string;
  }) {
    const area = params.area || 'johar-town';
    const [row] = await db
      .insert(users)
      .values({
        clerk_user_id: params.clerk_user_id,
        display_name: params.display_name,
        email: params.email || null,
        avatar_url: params.avatar_url || null,
        area,
      })
      .onConflictDoUpdate({
        target: users.clerk_user_id,
        set: {
          display_name: params.display_name,
          email: params.email || null,
          avatar_url: params.avatar_url || null,
          updated_at: sql`NOW()`
        },
      })
      .returning();

    return row;
  },

  async updateProfile(id: string, payload: UpdateProfileInput) {
    const [row] = await db
      .update(users)
      .set({
        ...(payload.display_name !== undefined && { display_name: payload.display_name }),
        ...(payload.area !== undefined && { area: payload.area }),
        updated_at: sql`NOW()`,
      })
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  },
};
