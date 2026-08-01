import { inArray } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { bookings, reviews } from '../schema.js';

const renterComments = [
  'Clear instructions, quick replies, and the item was exactly as described.',
  'Very easy pickup and everything was ready on time. Would rent again.',
  'Friendly lender and a genuinely smooth experience from start to finish.',
];
const ownerComments = [
  'Returned on time and took great care of the item. Recommended renter.',
  'Communication was excellent and handover was straightforward.',
  'Reliable renter. I would be happy to rent to them again.',
];

export async function seedReviews(seedBookings: (typeof bookings.$inferSelect)[]) {
  const completed = seedBookings.filter((booking) => booking.status === 'completed');
  if (!completed.length) return [];
  const existing = await db.select().from(reviews).where(inArray(reviews.bookingId, completed.map((booking) => booking.id)));
  const existingKeys = new Set(existing.map((review) => `${review.bookingId}:${review.reviewerId}`));
  const values: (typeof reviews.$inferInsert)[] = [];
  completed.forEach((booking, index) => {
    const renterReview = {
      bookingId: booking.id, listingId: booking.listing_id, reviewerId: booking.renter_id, targetId: booking.owner_id,
      role: 'as_lender' as const, rating: index % 3 === 0 ? 5 : 4,
      categoryRatings: { communication: 5, accuracy: index % 3 === 1 ? 4 : 5, value: 5 } as Record<string, number>,
      comment: renterComments[index % renterComments.length], anonymous: false,
    } satisfies typeof reviews.$inferInsert;
    const ownerReview = {
      bookingId: booking.id, listingId: booking.listing_id, reviewerId: booking.owner_id, targetId: booking.renter_id,
      role: 'as_renter' as const, rating: 5,
      categoryRatings: { communication: 5, care: 5, punctuality: index % 2 === 0 ? 5 : 4 } as Record<string, number>,
      comment: ownerComments[index % ownerComments.length], anonymous: false,
    } satisfies typeof reviews.$inferInsert;
    if (!existingKeys.has(`${renterReview.bookingId}:${renterReview.reviewerId}`)) values.push(renterReview);
    if (!existingKeys.has(`${ownerReview.bookingId}:${ownerReview.reviewerId}`)) values.push(ownerReview);
  });
  if (values.length) await db.insert(reviews).values(values);
  return db.select().from(reviews).where(inArray(reviews.bookingId, completed.map((booking) => booking.id)));
}
