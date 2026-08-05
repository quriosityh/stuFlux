import { db } from '../../infra/db/client.js';
import { bookings, conversations, listings, listingPhotos, reviews, users } from '../../../db/schema.js';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { CreateBookingInput } from './validations.js';
import type { BookingStatus } from './types.js';

const renterUser = alias(users, 'renter_user');
const ownerUser = alias(users, 'owner_user');

export const bookingsRepository = {
  async checkConfirmedOverlap(listingId: string, start: Date, end: Date) {
    const [row] = await db
      .select({
        exists: sql<boolean>`EXISTS (
        SELECT 1 FROM ${bookings}
        WHERE ${bookings.listing_id} = ${listingId}
          AND ${bookings.status} = 'confirmed'
          AND ${bookings.start_date} < ${end}
          AND ${bookings.end_date} > ${start}
      )`,
      })
      .from(bookings);
    return !!row?.exists;
  },

  async create(params: {
    data: CreateBookingInput;
    renterId: string;
    ownerId: string;
    totalDays: number;
    totalAmount: number;
    securityDeposit: number;
    deliveryFee: number;
  }) {
    const [row] = await db
      .insert(bookings)
      .values({
        listing_id: params.data.listing_id,
        renter_id: params.renterId,
        owner_id: params.ownerId,
        start_date: params.data.start_date.toISOString().split('T')[0],
        end_date: params.data.end_date.toISOString().split('T')[0],
        total_days: params.totalDays,
        total_amount: params.totalAmount,
        security_deposit: params.securityDeposit,
        delivery_fee: params.deliveryFee,
        status: 'pending',
        message: params.data.message,
      })
      .returning();
    return row;
  },

  async findById(id: string) {
    const [row] = await db
      .select({
        booking: bookings,
        listing: {
          id: listings.id,
          title: listings.title,
          daily_rate: listings.daily_rate,
          area: listings.area,
          rental_rules: listings.rental_rules,
          delivery_available: listings.delivery_available,
          image: listingPhotos.url,
        },
        renter: {
          id: renterUser.id,
          display_name: renterUser.display_name,
          avatar_url: renterUser.avatar_url,
          email: renterUser.email,
        },
        owner: {
          id: ownerUser.id,
          display_name: ownerUser.display_name,
          avatar_url: ownerUser.avatar_url,
          email: ownerUser.email,
        },
        conversation_id: conversations.id,
      })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listing_id, listings.id))
      .leftJoin(renterUser, eq(bookings.renter_id, renterUser.id))
      .leftJoin(ownerUser, eq(bookings.owner_id, ownerUser.id))
      .leftJoin(
        listingPhotos,
        and(
          eq(listingPhotos.listing_id, bookings.listing_id),
          eq(listingPhotos.is_primary, true),
          isNull(listingPhotos.deleted_at)
        )
      )
      .leftJoin(conversations, eq(conversations.booking_id, bookings.id))
      .where(eq(bookings.id, id));

    return row ?? null;
  },

  async findForUser(userId: string, role: 'renter' | 'owner', status?: BookingStatus, listingId?: string, limit = 50) {
    const conditions = [role === 'renter' ? eq(bookings.renter_id, userId) : eq(bookings.owner_id, userId)];
    if (status) {
      conditions.push(eq(bookings.status, status));
    }
    if (listingId) {
      conditions.push(eq(bookings.listing_id, listingId));
    }
    return db
      .select({
        booking: bookings,
        listing: {
          id: listings.id,
          title: listings.title,
          daily_rate: listings.daily_rate,
          area: listings.area,
          rental_rules: listings.rental_rules,
          delivery_available: listings.delivery_available,
          image: listingPhotos.url,
        },
        renter: {
          id: renterUser.id,
          display_name: renterUser.display_name,
          avatar_url: renterUser.avatar_url,
          email: renterUser.email,
        },
        owner: {
          id: ownerUser.id,
          display_name: ownerUser.display_name,
          avatar_url: ownerUser.avatar_url,
          email: ownerUser.email,
        },
        conversation_id: conversations.id,
        has_reviewed: sql<boolean>`CASE WHEN ${reviews.id} IS NOT NULL THEN TRUE ELSE FALSE END`,
      })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listing_id, listings.id))
      .leftJoin(renterUser, eq(bookings.renter_id, renterUser.id))
      .leftJoin(ownerUser, eq(bookings.owner_id, ownerUser.id))
      .leftJoin(
        listingPhotos,
        and(
          eq(listingPhotos.listing_id, bookings.listing_id),
          eq(listingPhotos.is_primary, true),
          isNull(listingPhotos.deleted_at)
        )
      )
      .leftJoin(conversations, eq(conversations.booking_id, bookings.id))
      .leftJoin(
        reviews,
        and(
          eq(reviews.bookingId, bookings.id),
          eq(reviews.reviewerId, userId),
          isNull(reviews.deletedAt)
        )
      )
      .where(and(...conditions))
      .orderBy(desc(bookings.created_at))
      .limit(limit);
  },

  async updateStatus(id: string, status: BookingStatus, timestampColumn: 'confirmed_at' | 'rejected_at' | 'cancelled_at' | 'completed_at') {
    const [row] = await db
      .update(bookings)
      .set({
        status,
        [timestampColumn]: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where(eq(bookings.id, id))
      .returning();
    return row ?? null;
  },

  /**
   * Finalize rentals whose confirmed end date has arrived. The end date is
   * exclusive throughout booking calculations: a booking from Aug 10 to Aug
   * 13 is a three-day rental and is no longer active on Aug 13. This keeps the
   * persisted booking status aligned with the status displayed to users and
   * with review eligibility.
   */
  async completeExpiredBookings() {
    return db
      .update(bookings)
      .set({
        status: 'completed',
        completed_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where(and(
        eq(bookings.status, 'confirmed'),
        sql`${bookings.end_date} <= CURRENT_DATE`
      ))
      .returning({ id: bookings.id });
  },

  async incrementListingBookingCount(listingId: string) {
    await db
      .update(listings)
      .set({ booking_count: sql`${listings.booking_count} + 1` })
      .where(eq(listings.id, listingId));
  },

  async getAvailability(listingId: string) {
    return db
      .select({ start_date: bookings.start_date, end_date: bookings.end_date, status: bookings.status })
      .from(bookings)
      .where(and(eq(bookings.listing_id, listingId), eq(bookings.status, 'confirmed')))
      .orderBy(bookings.start_date);
  },
};
