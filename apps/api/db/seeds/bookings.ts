import { inArray } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { bookings } from '../schema.js';

type ListingRef = { id: string; owner_id: string; daily_rate: number };
type PendingReviewFor = 'renter' | 'owner';
export type SeededBooking = typeof bookings.$inferSelect & { pendingReviewFor?: PendingReviewFor };
type BookingSeed = {
  listingIndex: number;
  renterIndex: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
  message: string;
  security_deposit: number;
  delivery_fee: number;
  pendingReviewFor?: PendingReviewFor;
};

const bookingSeed: readonly BookingSeed[] = [
  { listingIndex: 0, renterIndex: 1, start_date: '2026-08-10', end_date: '2026-08-13', status: 'pending', message: 'Need backup power for a small family event.', security_deposit: 8000, delivery_fee: 400 },
  { listingIndex: 1, renterIndex: 2, start_date: '2026-08-14', end_date: '2026-08-16', status: 'confirmed', message: 'Required for a home-office backup setup.', security_deposit: 7000, delivery_fee: 500 },
  { listingIndex: 2, renterIndex: 3, start_date: '2026-08-18', end_date: '2026-08-22', status: 'pending', message: 'Need it for some shelves and minor repairs.', security_deposit: 2000, delivery_fee: 0 },
  { listingIndex: 4, renterIndex: 4, start_date: '2026-08-20', end_date: '2026-08-21', status: 'confirmed', message: 'Booking for a university society shoot.', security_deposit: 10000, delivery_fee: 450 },
  { listingIndex: 6, renterIndex: 0, start_date: '2026-08-06', end_date: '2026-08-09', status: 'rejected', message: 'Would like to practise before a campus performance.', security_deposit: 3500, delivery_fee: 300 },
  { listingIndex: 9, renterIndex: 1, start_date: '2026-08-12', end_date: '2026-08-15', status: 'pending', message: 'Projector needed for a team presentation.', security_deposit: 8000, delivery_fee: 400 },
  { listingIndex: 10, renterIndex: 2, start_date: '2026-06-10', end_date: '2026-06-12', status: 'completed', message: 'Used for weekend rides with friends.', security_deposit: 3000, delivery_fee: 0 },
  { listingIndex: 11, renterIndex: 3, start_date: '2026-06-20', end_date: '2026-06-23', status: 'completed', message: 'Tent was needed for a short camping trip.', security_deposit: 3500, delivery_fee: 400 },
  { listingIndex: 0, renterIndex: 2, start_date: '2026-05-03', end_date: '2026-05-05', status: 'completed', message: 'Kept the freezer running during a power outage.', security_deposit: 8000, delivery_fee: 400 },
  { listingIndex: 4, renterIndex: 1, start_date: '2026-05-18', end_date: '2026-05-20', status: 'completed', message: 'Camera kit for a small product catalogue.', security_deposit: 10000, delivery_fee: 450 },
  { listingIndex: 5, renterIndex: 3, start_date: '2026-08-04', end_date: '2026-08-06', status: 'cancelled', message: 'Light for a makeup artist setup.', security_deposit: 1500, delivery_fee: 0 },
  { listingIndex: 3, renterIndex: 6, start_date: '2026-07-31', end_date: '2026-08-03', status: 'confirmed', message: 'Cleaning my driveway before guests arrive this weekend.', security_deposit: 4000, delivery_fee: 350 },
  { listingIndex: 8, renterIndex: 0, start_date: '2026-07-12', end_date: '2026-07-15', status: 'completed', message: 'Worn for my cousin’s mehndi dinner.', security_deposit: 12000, delivery_fee: 300 },
  { listingIndex: 9, renterIndex: 4, start_date: '2026-06-03', end_date: '2026-06-04', status: 'completed', message: 'A clear picture for our project presentation.', security_deposit: 8000, delivery_fee: 400 },
  { listingIndex: 2, renterIndex: 5, start_date: '2026-08-23', end_date: '2026-08-25', status: 'pending', message: 'For fitting curtain rails in a new apartment.', security_deposit: 2000, delivery_fee: 0 },
  // Review workflow: each rental is complete, one participant has reviewed,
  // and the named side below still has a review to submit.
  { listingIndex: 0, renterIndex: 2, start_date: '2026-07-01', end_date: '2026-07-03', status: 'completed', message: 'Mahnoor rented the generator for a three-day study-group backup.', security_deposit: 8000, delivery_fee: 400, pendingReviewFor: 'renter' as PendingReviewFor },
  { listingIndex: 8, renterIndex: 1, start_date: '2026-07-04', end_date: '2026-07-06', status: 'completed', message: 'Hamza rented Ayesha’s sherwani for a university formal.', security_deposit: 12000, delivery_fee: 300, pendingReviewFor: 'owner' as PendingReviewFor },
  { listingIndex: 9, renterIndex: 4, start_date: '2026-07-07', end_date: '2026-07-09', status: 'completed', message: 'Hira rented Hamza’s projector for her final presentation.', security_deposit: 8000, delivery_fee: 400, pendingReviewFor: 'owner' as PendingReviewFor },
] as const;

export async function seedBookings(userIds: string[], listingRefs: ListingRef[]) {
  const seededRows = bookingSeed.map((seed) => {
    const listing = listingRefs[seed.listingIndex];
    const renterId = userIds[seed.renterIndex] === listing.owner_id
      ? userIds[(seed.renterIndex + 1) % userIds.length]
      : userIds[seed.renterIndex];
    return { ...seed, listing, renterId, total_days: Number(new Date(seed.end_date).getTime() - new Date(seed.start_date).getTime()) / 86_400_000 };
  });
  const listingsWithCompletedBooking = new Set(
    seededRows.filter((row) => row.status === 'completed').map((row) => row.listing.id),
  );

  // Give every demo listing a genuine historical rental so its displayed rating
  // is backed by a completed booking and a review, not fabricated from popularity.
  const reviewCoverageRows = listingRefs
    .filter((listing) => !listingsWithCompletedBooking.has(listing.id))
    .map((listing, index) => {
      let renterId = userIds[(index + 1) % userIds.length]!;
      if (renterId === listing.owner_id) renterId = userIds[(index + 2) % userIds.length]!;
      return {
        listing,
        renterId,
        start_date: '2026-04-10',
        end_date: '2026-04-12',
        total_days: 2,
        status: 'completed' as const,
        message: 'Completed demo rental used to populate listing reviews.',
        security_deposit: 0,
        delivery_fee: 0,
      };
    });
  const rows = [...seededRows, ...reviewCoverageRows];
  const existing = await db.select().from(bookings).where(inArray(bookings.listing_id, listingRefs.map((listing) => listing.id)));
  const existingKeys = new Set(existing.map((booking) => `${booking.listing_id}:${booking.renter_id}:${booking.start_date}`));
  const missing = rows.filter((row) => !existingKeys.has(`${row.listing.id}:${row.renterId}:${row.start_date}`));

  if (missing.length) {
    await db.insert(bookings).values(missing.map((booking) => ({
      listing_id: booking.listing.id,
      renter_id: booking.renterId,
      owner_id: booking.listing.owner_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_days: booking.total_days,
      total_amount: booking.listing.daily_rate * booking.total_days,
      status: booking.status,
      message: booking.message,
      security_deposit: booking.security_deposit,
      delivery_fee: booking.delivery_fee,
      confirmed_at: booking.status === 'confirmed' ? new Date('2026-07-25T10:00:00Z') : null,
      rejected_at: booking.status === 'rejected' ? new Date('2026-07-29T10:00:00Z') : null,
      cancelled_at: booking.status === 'cancelled' ? new Date('2026-07-28T10:00:00Z') : null,
      completed_at: booking.status === 'completed' ? new Date('2026-06-25T10:00:00Z') : null,
    })));
  }
  const seededBookings = await db
    .select()
    .from(bookings)
    .where(inArray(bookings.listing_id, listingRefs.map((listing) => listing.id)));
  const pendingReviewByBookingKey = new Map(
    seededRows
      .filter((row) => row.pendingReviewFor)
      .map((row) => [`${row.listing.id}:${row.renterId}:${row.start_date}`, row.pendingReviewFor!]),
  );

  return seededBookings.map((booking) => ({
    ...booking,
    pendingReviewFor: pendingReviewByBookingKey.get(`${booking.listing_id}:${booking.renter_id}:${booking.start_date}`),
  })) satisfies SeededBooking[];
}
