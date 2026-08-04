import { db } from '../../infra/db/client.js';
import { users, userVerifications } from '../../../db/schema.js';
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

  async findDisplayName(id: string) {
    const [row] = await db
      .select({ display_name: users.display_name })
      .from(users)
      .where(eq(users.id, id));
    return row?.display_name ?? null;
  },

  async findEmailById(id: string) {
    const [row] = await db
      .select({ email: users.email, display_name: users.display_name })
      .from(users)
      .where(eq(users.id, id));
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
          updated_at: sql`NOW()`,
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
        ...(payload.area        !== undefined && { area: payload.area }),
        ...(payload.avatar_url  !== undefined && { avatar_url: payload.avatar_url }),
        updated_at: sql`NOW()`,
      })
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  },

  async isPhoneVerified(userId: string): Promise<boolean> {
    try {
      const res = await db.execute(sql`
        SELECT COALESCE(phone_verified, false) AS phone_verified
        FROM user_verifications
        WHERE user_id = ${userId}::uuid
        LIMIT 1
      `);
      return Boolean(res.rows?.[0]?.phone_verified);
    } catch {
      // No row in user_verifications yet — treat as unverified
      return false;
    }
  },

  async setPhoneVerified(userId: string) {
    const [row] = await db
      .insert(userVerifications)
      .values({ user_id: userId, phone_verified: true, verification_level: 'phone_verified' })
      .onConflictDoUpdate({
        target: userVerifications.user_id,
        set: { phone_verified: true, verification_level: 'phone_verified' },
      })
      .returning({ phone_verified: userVerifications.phone_verified });
    return Boolean(row?.phone_verified);
  },

  /**
   * Fetches booking stats + review ratings in parallel (2 DB calls concurrently)
   */
  async getUserStats(userId: string) {
    const [bookingRes, reviewRes] = await Promise.all([
      db.execute(sql`
        SELECT
          COALESCE(SUM(CASE WHEN owner_id  = ${userId}::uuid AND status = 'completed' THEN (total_amount + delivery_fee) ELSE 0 END), 0)::int AS total_earned,
          COALESCE(SUM(CASE WHEN owner_id  = ${userId}::uuid AND status = 'confirmed' THEN (total_amount + delivery_fee) ELSE 0 END), 0)::int AS pending_earnings,
          COALESCE(COUNT(CASE WHEN owner_id  = ${userId}::uuid AND status = 'completed' THEN 1 END), 0)::int AS completed_lent,
          COALESCE(COUNT(CASE WHEN renter_id = ${userId}::uuid AND status = 'completed' THEN 1 END), 0)::int AS completed_borrowed
        FROM bookings
        WHERE owner_id = ${userId}::uuid OR renter_id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT
          ROUND(AVG(CASE WHEN role = 'as_lender' THEN rating END)::numeric, 1)::float AS lender_rating_avg,
          COUNT(CASE WHEN role = 'as_lender' THEN 1 END)::int                         AS lender_rating_count,
          ROUND(AVG(CASE WHEN role = 'as_renter' THEN rating END)::numeric, 1)::float AS renter_rating_avg,
          COUNT(CASE WHEN role = 'as_renter' THEN 1 END)::int                         AS renter_rating_count
        FROM reviews
        WHERE target_id = ${userId}::uuid AND deleted_at IS NULL
      `),
    ]);

    const b = (bookingRes.rows?.[0] ?? {}) as Record<string, unknown>;
    const r = (reviewRes.rows?.[0] ?? {}) as Record<string, unknown>;

    return {
      total_earned:        Number(b.total_earned        ?? 0),
      pending_earnings:    Number(b.pending_earnings    ?? 0),
      completed_lent:      Number(b.completed_lent      ?? 0),
      completed_borrowed:  Number(b.completed_borrowed  ?? 0),
      lender_rating_avg:   Number(r.lender_rating_avg   ?? 0) || null,
      lender_rating_count: Number(r.lender_rating_count ?? 0),
      renter_rating_avg:   Number(r.renter_rating_avg   ?? 0) || null,
      renter_rating_count: Number(r.renter_rating_count ?? 0),
    };
  },
};
