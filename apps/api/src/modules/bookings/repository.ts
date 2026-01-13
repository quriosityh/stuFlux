import { db } from '../../infra/db/client.js';
import { bookings, listings } from '../../../db/schema.js';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import type { CreateBookingInput } from './validations.js';
import type { BookingStatus } from './types.js';

export const bookingsRepository = {
  async checkConfirmedOverlap(listingId: string, start: Date, end: Date) {
    const [row] = await db
      .select({ exists: sql<boolean>`EXISTS (
        SELECT 1 FROM ${bookings}
        WHERE ${bookings.listing_id} = ${listingId}
          AND ${bookings.status} = 'confirmed'
          AND ${bookings.start_date} < ${end}
          AND ${bookings.end_date} > ${start}
      )` })
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
        start_date: params.data.start_date,
        end_date: params.data.end_date,
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
    const [row] = await db.select().from(bookings).where(eq(bookings.id, id));
    return row ?? null;
  },

  async findForUser(userId: string, role: 'renter' | 'owner', status?: BookingStatus, listingId?: string) {
    const conditions = [role === 'renter' ? eq(bookings.renter_id, userId) : eq(bookings.owner_id, userId)];
    if (status) {
      conditions.push(eq(bookings.status, status));
    }
    if (listingId) {
      conditions.push(eq(bookings.listing_id, listingId));
    }
    return db.select().from(bookings).where(and(...conditions)).orderBy(bookings.created_at);
  },

  async updateStatus(id: string, status: BookingStatus, timestampColumn: 'confirmed_at' | 'rejected_at' | 'completed_at') {
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
