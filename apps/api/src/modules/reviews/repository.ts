import { db } from '../../infra/db/client.js';
import { reviews, bookings, listings, users } from '../../../db/schema.js';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import type { NewReview, Review } from './schema.js';
import type { GetReviewsQuery } from './validations.js';

/**
 * Get listing details
 */
export const getListingDetails = async (listingId: string) => {
  const [listing] = await db
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
export const getBookingDetails = async (bookingId: string) => {
  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      renterId:  bookings.renter_id,
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
  reviewerId: string
): Promise<Review | null> => {
  const [review] = await db
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
export const findReviewById = async (id: string): Promise<Review | null> => {
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)));

  return review || null;
};

/**
 * Create new review
 */
export const createReview = async (data: NewReview): Promise<Review> => {
  const [review] = await db.insert(reviews).values(data).returning();
  return review;
};

/**
 * Soft delete review
 */
export const softDeleteReview = async (id: string): Promise<boolean> => {
  const [deleted] = await db.update(reviews)
    .set({ deletedAt: new Date() })
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
    .returning();

  return !!deleted;
};

/**
 * Update review
 */
export const updateReview = async (id: string, data: Partial<NewReview>): Promise<Review | null> => {
  const [updated] = await db.update(reviews)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
    .returning();

  return updated || null;
};

/**
 * Rate limiting (reviews in last 1 hour)
 */
export const getRecentReviewCount = async (userId: string): Promise<number> => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(
      eq(reviews.reviewerId, userId),
      sql`${reviews.createdAt} >= ${oneHourAgo}`
    ));

  return count;
};

/**
 * Update anonymity after both parties review or 14 days
 */
export const updateAnonymityStatus = async (bookingId: string): Promise<void> => {
  const bookingReviews = await db.select().from(reviews)
    .where(and(eq(reviews.bookingId, bookingId), isNull(reviews.deletedAt)));

  if (bookingReviews.length === 2) {
    const reviewIds = bookingReviews.map(r => r.id);
    await db.update(reviews).set({ anonymous: false, updatedAt: new Date() })
      .where(sql`${reviews.id} IN (${reviewIds.map(id => `'${id}'`).join(',')})`);
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  await db.update(reviews).set({ anonymous: false, updatedAt: new Date() })
    .where(and(
      eq(reviews.bookingId, bookingId),
      isNull(reviews.deletedAt),
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
    query.reviewerType ? eq(reviews.reviewerType, query.reviewerType) : sql`TRUE`,
    query.category ? sql`${reviews.categoryRatings}->>${query.category} IS NOT NULL` : sql`TRUE`
  );

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      categoryRatings: reviews.categoryRatings,
      comment: reviews.comment,
      reviewerType: reviews.reviewerType,
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
    .get();

  return {
    reviews: reviewRows,
    pagination: { page, limit, total: Number(statsRow?.total || 0) },
    ratings: {
      average: parseFloat(statsRow?.avgRating?.toFixed(1) || '0'),
      category: {
        cleanliness: parseFloat(statsRow?.avgCleanliness?.toFixed(1) || '0'),
        communication: parseFloat(statsRow?.avgCommunication?.toFixed(1) || '0'),
        accuracy: parseFloat(statsRow?.avgAccuracy?.toFixed(1) || '0'),
        value: parseFloat(statsRow?.avgValue?.toFixed(1) || '0'),
      },
    },
  };
};

/**
 * Get paginated owner reviews across all their listings
 */
export const getOwnerReviews = async (query: GetReviewsQuery) => {
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
    eq(reviews.ownerId, query.ownerId!),
    isNull(reviews.deletedAt),
    query.reviewerType ? eq(reviews.reviewerType, query.reviewerType) : sql`TRUE`,
    query.category ? sql`${reviews.categoryRatings}->>${query.category} IS NOT NULL` : sql`TRUE`
  );

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      categoryRatings: reviews.categoryRatings,
      comment: reviews.comment,
      reviewerType: reviews.reviewerType,
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
    .get();

  return {
    reviews: reviewRows,
    pagination: { page, limit, total: Number(statsRow?.total || 0) },
    ratings: {
      average: parseFloat(statsRow?.avgRating?.toFixed(1) || '0'),
      category: {
        cleanliness: parseFloat(statsRow?.avgCleanliness?.toFixed(1) || '0'),
        communication: parseFloat(statsRow?.avgCommunication?.toFixed(1) || '0'),
        accuracy: parseFloat(statsRow?.avgAccuracy?.toFixed(1) || '0'),
        value: parseFloat(statsRow?.avgValue?.toFixed(1) || '0'),
      },
    },
  };
};
