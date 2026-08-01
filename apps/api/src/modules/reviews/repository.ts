import { db } from '../../infra/db/client.js';
import { reviews, bookings, listings, users } from '../../../db/schema.js';
import { eq, and, isNull, desc, asc, sql, inArray } from 'drizzle-orm';
import type { NewReview, Review } from './schema.js';
import type { GetReviewsQuery } from './validation.js';
import type { PgTransaction } from 'drizzle-orm/pg-core';

// Constants
const REVIEW_ANONYMITY_PERIOD_DAYS = 14;

/**
 * Get listing details
 */
export const getListingDetails = async (listingId: string, tx: any = db) => {
  const [listing] = await tx
    .select({
      id: listings.id,
      ownerId: listings.owner_id,
      title: listings.title,
    })
    .from(listings)
    .where(eq(listings.id, listingId));

  return listing || null;
};

/**
 * Get booking details
 */
export const getBookingDetails = async (bookingId: string, tx: any = db) => {
  const [booking] = await tx
    .select({
      id: bookings.id,
      status: bookings.status,
      renterId: bookings.renter_id,
      listingId: bookings.listing_id,
      startDate: bookings.start_date,
      endDate: bookings.end_date,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId));

  return booking || null;
};

/**
 * Find review by booking + reviewer
 */
export const findReviewByBookingAndReviewer = async (
  bookingId: string,
  reviewerId: string,
  tx: any = db
): Promise<Review | null> => {
  const [review] = await tx
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.bookingId, bookingId),
      eq(reviews.reviewerId, reviewerId),
      isNull(reviews.deletedAt)
    ));

  return review || null;
};

/**
 * Find review by ID
 */
export const findReviewById = async (id: string, tx: any = db): Promise<Review | null> => {
  const [review] = await tx
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)));

  return review || null;
};

/**
 * Create new review
 */
export const createReview = async (data: NewReview, tx: any = db): Promise<Review> => {
  const [review] = await tx.insert(reviews).values(data).returning();
  return review;
};

/**
 * Soft delete review
 */
export const softDeleteReview = async (id: string, tx: any = db): Promise<boolean> => {
  const [deleted] = await tx.update(reviews)
    .set({ deletedAt: new Date() })
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
    .returning();

  return !!deleted;
};

/**
 * Update review
 */
export const updateReview = async (
  id: string, 
  data: Partial<NewReview>,
  tx: any = db
): Promise<Review | null> => {
  const [updated] = await tx.update(reviews)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
    .returning();

  return updated || null;
};

/**
 * Rate limiting (reviews in last 1 hour)
 */
export const getRecentReviewCount = async (userId: string, tx: any = db): Promise<number> => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(
      eq(reviews.reviewerId, userId),
      sql`${reviews.createdAt} >= ${oneHourAgo}`
    ));

  return count;
};

/**
 * Update anonymity after both parties review or 14 days
 * ✅ FIXED: SQL injection vulnerability removed
 */
export const updateAnonymityStatus = async (bookingId: string, tx: any = db): Promise<void> => {
  const bookingReviews = await tx.select().from(reviews)
    .where(and(eq(reviews.bookingId, bookingId), isNull(reviews.deletedAt)));

  // Case 1: Both parties have reviewed - reveal immediately
  if (bookingReviews.length === 2) {
    const reviewIds = bookingReviews.map((r: any) => r.id);
    await tx.update(reviews)
      .set({ anonymous: false, updatedAt: new Date() })
      .where(inArray(reviews.id, reviewIds)); // ✅ SAFE: Using inArray instead of string interpolation
  }

  // Case 2: 14 days have passed - reveal any remaining anonymous reviews
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - REVIEW_ANONYMITY_PERIOD_DAYS);

  await tx.update(reviews)
    .set({ anonymous: false, updatedAt: new Date() })
    .where(and(
      eq(reviews.bookingId, bookingId),
      isNull(reviews.deletedAt),
      eq(reviews.anonymous, true),
      sql`${reviews.createdAt} <= ${fourteenDaysAgo}`
    ));
};

/**
 * Get paginated listing reviews with sorting + category averages
 */
export const getListingReviews = async (query: GetReviewsQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (query.sort) {
    case 'highest':
      orderBy = desc(reviews.rating);
      break;
    case 'lowest':
      orderBy = asc(reviews.rating);
      break;
    default:
      orderBy = desc(reviews.createdAt);
  }

  const whereClause = and(
    eq(reviews.listingId, query.listingId!),
    isNull(reviews.deletedAt),
    query.role && query.role !== 'all' ? eq(reviews.role, query.role as any) : sql`TRUE`,
    query.category ? sql`${reviews.categoryRatings}->>${query.category} IS NOT NULL` : sql`TRUE`
  );

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      categoryRatings: reviews.categoryRatings,
      comment: reviews.comment,
      role: reviews.role,
      anonymous: reviews.anonymous,
      reviewerId: reviews.reviewerId,
      targetId: reviews.targetId,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const statsRow = await db
    .select({
      total: sql<number>`count(*)`,
      avgRating: sql<number>`avg(${reviews.rating}::numeric)`,
      avgCleanliness: sql<number>`avg((${reviews.categoryRatings}->>'cleanliness')::numeric)`,
      avgCommunication: sql<number>`avg((${reviews.categoryRatings}->>'communication')::numeric)`,
      avgAccuracy: sql<number>`avg((${reviews.categoryRatings}->>'accuracy')::numeric)`,
      avgValue: sql<number>`avg((${reviews.categoryRatings}->>'value')::numeric)`,
    })
    .from(reviews)
    .where(whereClause)
    .then(rows => rows[0]);

  return {
    reviews: reviewRows,
    pagination: { page, limit, total: Number(statsRow?.total || 0) },
    ratings: {
      average: parseFloat(statsRow?.avgRating ? Number(statsRow.avgRating).toFixed(1) : '0'),
      category: {
        cleanliness: parseFloat(statsRow?.avgCleanliness ? Number(statsRow.avgCleanliness).toFixed(1) : '0'),
        communication: parseFloat(statsRow?.avgCommunication ? Number(statsRow.avgCommunication).toFixed(1) : '0'),
        accuracy: parseFloat(statsRow?.avgAccuracy ? Number(statsRow.avgAccuracy).toFixed(1) : '0'),
        value: parseFloat(statsRow?.avgValue ? Number(statsRow.avgValue).toFixed(1) : '0'),
      },
    },
  };
};

/**
 * Get paginated user reviews (received as lender or renter)
 */
export const getUserReviews = async (query: GetReviewsQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (query.sort) {
    case 'highest':
      orderBy = desc(reviews.rating);
      break;
    case 'lowest':
      orderBy = asc(reviews.rating);
      break;
    default:
      orderBy = desc(reviews.createdAt);
  }

  const targetId = query.targetId || query.ownerId;

  const whereClause = and(
    eq(reviews.targetId, targetId!),
    isNull(reviews.deletedAt),
    query.role ? eq(reviews.role, query.role as any) : sql`TRUE`
  );

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      categoryRatings: reviews.categoryRatings,
      comment: reviews.comment,
      role: reviews.role,
      anonymous: reviews.anonymous,
      reviewerId: reviews.reviewerId,
      targetId: reviews.targetId,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const statsRow = await db
    .select({
      total: sql<number>`count(*)`,
      avgRating: sql<number>`avg(${reviews.rating}::numeric)`,
    })
    .from(reviews)
    .where(whereClause)
    .then(rows => rows[0]);

  return {
    reviews: reviewRows,
    pagination: { page, limit, total: Number(statsRow?.total || 0) },
    ratings: {
      average: parseFloat(statsRow?.avgRating ? Number(statsRow.avgRating).toFixed(1) : '0'),
    },
  };
};