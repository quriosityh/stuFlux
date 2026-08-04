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

  async completeOnboarding(id: string, payload: UpdateProfileInput) {
    const [row] = await db
      .update(users)
      .set({
        display_name: payload.display_name!,
        area: payload.area!,
        onboarding_completed: true,
        updated_at: sql`NOW()`,
      })
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  },

  async getUserStats(userId: string) {
    // 1. Booking stats & earnings
    const bookingRes = await db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN owner_id = ${userId}::uuid AND status = 'completed' THEN (total_amount + delivery_fee) ELSE 0 END), 0)::int AS total_earned,
        COALESCE(SUM(CASE WHEN owner_id = ${userId}::uuid AND status IN ('confirmed', 'ongoing') THEN (total_amount + delivery_fee) ELSE 0 END), 0)::int AS pending_earnings,
        COALESCE(COUNT(CASE WHEN owner_id = ${userId}::uuid AND status = 'completed' THEN 1 END), 0)::int AS completed_lent,
        COALESCE(COUNT(CASE WHEN renter_id = ${userId}::uuid AND status = 'completed' THEN 1 END), 0)::int AS completed_borrowed
      FROM bookings
      WHERE (owner_id = ${userId}::uuid OR renter_id = ${userId}::uuid)
    `);

    // 2. Rating stats from reviews
    const reviewRes = await db.execute(sql`
      SELECT
        COALESCE(AVG(CASE WHEN role = 'as_lender' THEN rating END), 0)::float AS lender_rating_avg,
        COALESCE(COUNT(CASE WHEN role = 'as_lender' THEN 1 END), 0)::int AS lender_rating_count,
        COALESCE(AVG(CASE WHEN role = 'as_renter' THEN rating END), 0)::float AS renter_rating_avg,
        COALESCE(COUNT(CASE WHEN role = 'as_renter' THEN 1 END), 0)::int AS renter_rating_count
      FROM reviews
      WHERE target_id = ${userId}::uuid AND deleted_at IS NULL
    `);

    const bookingStats = (bookingRes.rows?.[0] || {}) as any;
    const reviewStats = (reviewRes.rows?.[0] || {}) as any;

    const lenderAvg = Number(reviewStats.lender_rating_avg || 0);
    const renterAvg = Number(reviewStats.renter_rating_avg || 0);

    return {
      total_earned: Number(bookingStats.total_earned || 0),
      pending_earnings: Number(bookingStats.pending_earnings || 0),
      completed_lent: Number(bookingStats.completed_lent || 0),
      completed_borrowed: Number(bookingStats.completed_borrowed || 0),
      lender_rating_avg: lenderAvg ? parseFloat(lenderAvg.toFixed(1)) : null,
      lender_rating_count: Number(reviewStats.lender_rating_count || 0),
      renter_rating_avg: renterAvg ? parseFloat(renterAvg.toFixed(1)) : null,
      renter_rating_count: Number(reviewStats.renter_rating_count || 0),
    };
  },
};
