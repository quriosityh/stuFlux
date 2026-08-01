import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { bookings, listings, users } from '../../../db/schema.js';

export const reviewRoleEnum = pgEnum('review_role', ['as_lender', 'as_renter']);

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),

    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),

    reviewerId: uuid('reviewer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    targetId: uuid('target_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    role: reviewRoleEnum('role').notNull(),

    rating: integer('rating').notNull(),

    categoryRatings: jsonb('category_ratings')
      .$type<Record<string, number>>()
      .default({})
      .notNull(),

    comment: text('comment'),

    anonymous: boolean('anonymous').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    /**
     * 🔥 IMPORTANT:
     * One review per booking per reviewer (DB-level guarantee)
     */
    uniqueBookingReviewer: uniqueIndex('uniq_booking_reviewer')
      .on(table.bookingId, table.reviewerId),
  })
);

/**
 * Relations
 */
export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),

  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id],
  }),

  target: one(users, {
    fields: [reviews.targetId],
    references: [users.id],
  }),

  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
