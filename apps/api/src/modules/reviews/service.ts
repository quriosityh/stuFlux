import { AppError } from '../../common/errors.js';
import * as repository from './repository.js';
import type { CreateReviewInput, UpdateReviewInput, GetReviewsQuery } from './validations.js';
import type { NewReview } from './schema.js';
import { db } from '../../infra/db/client.js';
import { reviews } from './schema.js';
import { and, eq, isNull, sql } from 'drizzle-orm';

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
    if (recentReviewCount >= 3) {
      throw new AppError(
        'You have reached the maximum number of reviews per hour (3). Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // 2. Get booking
    const booking = await repository.getBookingDetails(input.bookingId, tx);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    if (booking.status !== 'completed') {
      throw new AppError('You can only review completed bookings', 400, 'BOOKING_NOT_COMPLETED');
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
    const [review] = await tx.insert(reviews).values(reviewData).returning();

    // 11. Update anonymity status in SAME transaction
    await repository.updateAnonymityStatus(input.bookingId, tx);

    // 12. Return updated review
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
  return await repository.getOwnerReviews(query);
};

/**
 * Update review
 */
export const updateReview = async (userId: string, reviewId: string, input: UpdateReviewInput) => {
  const review = await repository.findReviewById(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  if (review.reviewerId !== userId) throw new AppError('Not authorized to edit', 403, 'UNAUTHORIZED_EDIT');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  if (review.createdAt < sevenDaysAgo) throw new AppError('Edit window expired (7 days)', 400, 'EDIT_WINDOW_EXPIRED');

  let overallRating = review.rating;
  if (input.rating !== undefined || input.categoryRatings !== undefined) {
    const newRating = input.rating ?? review.rating;
    const newCategories = input.categoryRatings ?? (review.categoryRatings as Record<string, number>);
    overallRating = calculateOverallRating(newRating, newCategories);
  }

  const updateData: Partial<NewReview> = {};
  if (input.rating !== undefined || input.categoryRatings !== undefined) updateData.rating = overallRating;
  if (input.categoryRatings !== undefined) updateData.categoryRatings = input.categoryRatings;
  if (input.comment !== undefined) updateData.comment = input.comment;

  const updatedReview = await repository.updateReview(reviewId, updateData);
  if (!updatedReview) throw new AppError('Failed to update review', 500, 'UPDATE_FAILED');
  return updatedReview;
};

/**
 * Delete review (soft delete)
 */
export const deleteReview = async (userId: string, reviewId: string) => {
  const review = await repository.findReviewById(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  if (review.reviewerId !== userId) throw new AppError('Not authorized to delete', 403, 'UNAUTHORIZED_DELETE');

  const deleted = await repository.softDeleteReview(reviewId);
  if (!deleted) throw new AppError('Failed to delete review', 500, 'DELETE_FAILED');
  return { success: true, message: 'Review deleted successfully' };
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId: string) => {
  const review = await repository.findReviewById(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  return review;
};
