import { AppError } from '../../common/errors.js';
import * as repository from './repository.js';
import type { CreateReviewInput, UpdateReviewInput, GetReviewsQuery } from './validations.js';
import type { NewReview } from './schema.js';
import { db } from '../../infra/db/client.js';

// Constants
const RATE_LIMIT_REVIEWS_PER_HOUR = 3;
const REVIEW_EDIT_WINDOW_DAYS = 7;

/**
 * Service layer for review business logic
 * Enforces all review rules and policies
 */

/**
 * Calculate overall rating from category ratings
 */
const calculateOverallRating = (
  rating: number,
  categoryRatings?: Record<string, number>
): number => {
  if (!categoryRatings || Object.keys(categoryRatings).length === 0) {
    return rating;
  }
  const values = Object.values(categoryRatings);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
};

/**
 * Determine reviewer type based on booking
 */
const determineReviewerType = (
  reviewerId: string,
  renterId: string,
  ownerId: string
): 'renter' | 'owner' => {
  if (reviewerId === renterId) return 'renter';
  if (reviewerId === ownerId) return 'owner';
  throw new AppError('Reviewer is not part of this booking', 403, 'INVALID_REVIEWER');
};

/**
 * Create a new review (TRANSACTION SAFE)
 */
export const createReview = async (userId: string, input: CreateReviewInput) => {
  return await db.transaction(async (tx) => {
    // 1. Rate limiting
    const recentReviewCount = await repository.getRecentReviewCount(userId, tx);
    if (recentReviewCount >= RATE_LIMIT_REVIEWS_PER_HOUR) {
      throw new AppError(
        `You have reached the maximum number of reviews per hour (${RATE_LIMIT_REVIEWS_PER_HOUR}). Please try again later.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // 2. Get booking
    const booking = await repository.getBookingDetails(input.bookingId, tx);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    
    // ✅ FIXED: Check booking status AND end date is in the past
    if (booking.status !== 'completed') {
      throw new AppError('You can only review completed bookings', 400, 'BOOKING_NOT_COMPLETED');
    }

    const now = new Date();
    if (booking.endDate > now) {
      throw new AppError('You can only review bookings after the end date', 400, 'BOOKING_NOT_ENDED');
    }

    // 3. Get listing
    const listing = await repository.getListingDetails(booking.listingId, tx);
    if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');

    // 4. Verify user part of booking
    if (userId !== booking.renterId && userId !== listing.ownerId) {
      throw new AppError('You are not authorized to review this booking', 403, 'UNAUTHORIZED_REVIEWER');
    }

    // 5. Prevent self-review
    if (userId === listing.ownerId && booking.renterId === listing.ownerId) {
      throw new AppError('You cannot review your own listing', 400, 'SELF_REVIEW_NOT_ALLOWED');
    }

    // 6. Check duplicate (unique constraint also protects at DB level)
    const existingReview = await repository.findReviewByBookingAndReviewer(input.bookingId, userId, tx);
    if (existingReview) {
      throw new AppError('You have already reviewed this booking', 400, 'DUPLICATE_REVIEW');
    }

    // 7. Reviewer type
    const reviewerType = determineReviewerType(userId, booking.renterId, listing.ownerId);

    // 8. Overall rating
    const overallRating = calculateOverallRating(input.rating, input.categoryRatings);

    // 9. Prepare review data
    const reviewData: NewReview = {
      bookingId: input.bookingId,
      listingId: booking.listingId,
      ownerId: listing.ownerId,
      reviewerId: userId,
      reviewerType,
      rating: overallRating,
      categoryRatings: input.categoryRatings || {},
      comment: input.comment,
      anonymous: true,
    };

    // 10. Insert review in TRANSACTION
    const review = await repository.createReview(reviewData, tx);

    // 11. Update anonymity status in SAME transaction
    await repository.updateAnonymityStatus(input.bookingId, tx);

    // 12. Return updated review (fetch fresh to get anonymity status)
    const updatedReview = await repository.findReviewById(review.id, tx);
    return updatedReview;
  });
};

/**
 * Get reviews for a listing
 */
export const getListingReviews = async (query: GetReviewsQuery) => {
  if (!query.listingId) throw new AppError('Listing ID is required', 400, 'MISSING_LISTING_ID');
  return await repository.getListingReviews(query);
};

/**
 * Get reviews for owner across all listings
 */
export const getOwnerReviews = async (query: GetReviewsQuery) => {
  if (!query.ownerId) throw new AppError('Owner ID is required', 400, 'MISSING_OWNER_ID');

  // 1️⃣ Reviews on owner's listings by renters
  const fromRenters = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.ownerId, query.ownerId!),
      eq(reviews.reviewerType, 'renter'),
      isNull(reviews.deletedAt)
    ));

  // 2️⃣ Reviews owner received when they were a renter (booking of other owners)
  const fromOwners = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.reviewerType, 'owner'),  // reviewer is another owner
      eq(reviews.reviewerId, query.ownerId!), // current owner was the renter
      isNull(reviews.deletedAt)
    ));

  // 3️⃣ Total reviews
  const totalReviews = fromRenters.length + fromOwners.length;

  // 4️⃣ Average rating based on renter reviews (primary)
  const avgRating = fromRenters.length
    ? parseFloat((fromRenters.reduce((sum, r) => sum + r.rating, 0) / fromRenters.length).toFixed(1))
    : 0;

  // 5️⃣ Average category ratings based on renter reviews
  const avgCategory = {
    cleanliness: fromRenters.length ? parseFloat((fromRenters.reduce((sum, r) => sum + (r.categoryRatings.cleanliness || 0), 0) / fromRenters.length).toFixed(1)) : 0,
    communication: fromRenters.length ? parseFloat((fromRenters.reduce((sum, r) => sum + (r.categoryRatings.communication || 0), 0) / fromRenters.length).toFixed(1)) : 0,
    accuracy: fromRenters.length ? parseFloat((fromRenters.reduce((sum, r) => sum + (r.categoryRatings.accuracy || 0), 0) / fromRenters.length).toFixed(1)) : 0,
    value: fromRenters.length ? parseFloat((fromRenters.reduce((sum, r) => sum + (r.categoryRatings.value || 0), 0) / fromRenters.length).toFixed(1)) : 0,
  };

  return {
    total: totalReviews,
    fromRenters: fromRenters.length,
    fromOwners: fromOwners.length,
    reviewsFromRenters: fromRenters,
    reviewsFromOwners: fromOwners,
    ratings: {
      average: avgRating,
      category: avgCategory,
    },
  };
};


/**
 * Update review
 */
export const updateReview = async (userId: string, reviewId: string, input: UpdateReviewInput) => {
  return await db.transaction(async (tx) => {
    const review = await repository.findReviewById(reviewId, tx);
    if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    if (review.reviewerId !== userId) {
      throw new AppError('Not authorized to edit this review', 403, 'UNAUTHORIZED_EDIT');
    }

    // Check edit window
    const editWindowEnd = new Date(review.createdAt);
    editWindowEnd.setDate(editWindowEnd.getDate() + REVIEW_EDIT_WINDOW_DAYS);
    
    if (new Date() > editWindowEnd) {
      throw new AppError(
        `Edit window expired (${REVIEW_EDIT_WINDOW_DAYS} days)`, 
        400, 
        'EDIT_WINDOW_EXPIRED'
      );
    }

    // Calculate new overall rating if rating/categoryRatings changed
    let overallRating = review.rating;
    if (input.rating !== undefined || input.categoryRatings !== undefined) {
      const newRating = input.rating ?? review.rating;
      const newCategories = input.categoryRatings ?? (review.categoryRatings as Record<string, number>);
      overallRating = calculateOverallRating(newRating, newCategories);
    }

    // Prepare update data
    const updateData: Partial<NewReview> = {};
    if (input.rating !== undefined || input.categoryRatings !== undefined) {
      updateData.rating = overallRating;
    }
    if (input.categoryRatings !== undefined) updateData.categoryRatings = input.categoryRatings;
    if (input.comment !== undefined) updateData.comment = input.comment;

    // Update in transaction
    const updatedReview = await repository.updateReview(reviewId, updateData, tx);
    if (!updatedReview) throw new AppError('Failed to update review', 500, 'UPDATE_FAILED');
    
    return updatedReview;
  });
};

/**
 * Delete review (soft delete)
 */
export const deleteReview = async (userId: string, reviewId: string) => {
  return await db.transaction(async (tx) => {
    const review = await repository.findReviewById(reviewId, tx);
    if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    if (review.reviewerId !== userId) {
      throw new AppError('Not authorized to delete this review', 403, 'UNAUTHORIZED_DELETE');
    }

    const deleted = await repository.softDeleteReview(reviewId, tx);
    if (!deleted) throw new AppError('Failed to delete review', 500, 'DELETE_FAILED');
    
    return { success: true, message: 'Review deleted successfully' };
  });
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId: string) => {
  const review = await repository.findReviewById(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  return review;
};