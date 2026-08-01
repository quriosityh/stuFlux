import { db } from '../../src/infra/db/client.js';
import { bookings } from '../schema.js';

export async function seedBookings(
  userIds: string[],
  listingIds: { id: string; owner_id: string; daily_rate: number }[],
) {
  const bookingsSeed = [
    { listingIndex: 0, renterIndex: 1, start_date: '2026-08-10', end_date: '2026-08-13', total_days: 3, status: 'pending', message: 'Need backup power for a small family event.', security_deposit: 8000, delivery_fee: 400 },
    { listingIndex: 1, renterIndex: 2, start_date: '2026-08-14', end_date: '2026-08-16', total_days: 2, status: 'confirmed', message: 'Required for a home-office backup setup.', security_deposit: 7000, delivery_fee: 500 },
    { listingIndex: 2, renterIndex: 3, start_date: '2026-08-18', end_date: '2026-08-22', total_days: 4, status: 'pending', message: 'Need it for some shelves and minor repairs.', security_deposit: 2000, delivery_fee: 0 },
    { listingIndex: 4, renterIndex: 4, start_date: '2026-08-20', end_date: '2026-08-21', total_days: 1, status: 'confirmed', message: 'Booking for a university society shoot.', security_deposit: 10000, delivery_fee: 450 },
    { listingIndex: 6, renterIndex: 0, start_date: '2026-08-06', end_date: '2026-08-09', total_days: 3, status: 'rejected', message: 'Would like to practise before a campus performance.', security_deposit: 3500, delivery_fee: 300 },
    { listingIndex: 9, renterIndex: 1, start_date: '2026-08-12', end_date: '2026-08-15', total_days: 3, status: 'pending', message: 'Projector needed for a team presentation.', security_deposit: 8000, delivery_fee: 400 },
    { listingIndex: 10, renterIndex: 2, start_date: '2026-06-10', end_date: '2026-06-12', total_days: 2, status: 'completed', message: 'Used for weekend rides with friends.', security_deposit: 3000, delivery_fee: 0 },
    { listingIndex: 11, renterIndex: 3, start_date: '2026-06-20', end_date: '2026-06-23', total_days: 3, status: 'completed', message: 'Tent was needed for a short camping trip.', security_deposit: 3500, delivery_fee: 400 },
  ] as const;

  return db
    .insert(bookings)
    .values(bookingsSeed.map((booking) => {
      const listing = listingIds[booking.listingIndex];
      const renterId = userIds[booking.renterIndex] === listing.owner_id
        ? userIds[(booking.renterIndex + 1) % userIds.length]
        : userIds[booking.renterIndex];

      return {
        listing_id: listing.id,
        renter_id: renterId,
        owner_id: listing.owner_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_days: booking.total_days,
        total_amount: listing.daily_rate * booking.total_days,
        status: booking.status,
        message: booking.message,
        security_deposit: booking.security_deposit,
        delivery_fee: booking.delivery_fee,
      };
    }))
    .returning();
}
