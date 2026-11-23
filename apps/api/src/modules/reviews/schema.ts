import { relations } from 'drizzle-orm';
import { bookings, listings, reviewRoleEnum, reviews, users } from '../../../db/schema.js';

export { reviewRoleEnum, reviews };

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  listing: one(listings, { fields: [reviews.listingId], references: [listings.id] }),
  target: one(users, { fields: [reviews.targetId], references: [users.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id] }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
