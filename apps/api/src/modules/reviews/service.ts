import { AppError } from '../../common/errors.js';
import * as repository from './repository.js';
import type { CreateReviewInput, UpdateReviewInput, GetReviewsQuery } from './validations.js';
import type { NewReview } from './schema.js';

/**
 * Service layer for review business logic
 * Enforces all review rules and policies
 */

/**
 * Calculate overall rating from category ratings
 * If categories provided, average them; otherwise use the single rating
 */
const calculateOverallRating = (
  rating: number,
  categoryRatings?: Record<string, number>
): number => {
  if (!categoryRatings || Object.keys(categoryRatings).length === 0) {
    return rating;
  }

  const categoryValues = Object.values(categoryRatings);
  const sum = categoryValues.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / categoryValues.length);
};

/**
 * Determine reviewer type based on booking
 */
const determineReviewerType = (
  reviewerId: string,
  renterId: string,
  ownerId: string
): 'renter' | 'owner' => {
  if (reviewerId === renterId) {
    return 'renter';
  } else if (reviewerId === ownerId) {
    return 'owner';
  }
  throw new AppError('Reviewer is not part of this booking', 403, 'INVALID_REVIEWER');
};

/**
 * Create a new review
 * Enforces all business rules:
 * - Booking must be completed
 * - User must be part of the booking
 * - User cannot review themselves
 * - One review per booking per user
 * - Rate limiting: max 3 reviews/hour
 */
export const createReview = async (
  userId: string,
  input: CreateReviewInput
) => {
  // 1. Check rate limiting - max 3 reviews per hour
  const recentReviewCount = await repository.getRecentReviewCount(userId);
  if (recentReviewCount >= 3) {
    throw new AppError(
      'You have reached the maximum number of reviews per hour (3). Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  // 2. Get booking details and validate
  const booking = await repository.getBookingDetails(input.bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  // 3. Verify booking is completed
  if (booking.status !== 'completed') {
    throw new AppError(
      'You can only review completed bookings',
      400,
      'BOOKING_NOT_COMPLETED'
    );
  }

  // 4. Get listing details
  const listing = await repository.getListingDetails(booking.listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  // 5. Verify user is part of the booking (renter or owner)
  if (userId !== booking.renterId && userId !== listing.ownerId) {
    throw new AppError(
      'You are not authorized to review this booking',
      403,
      'UNAUTHORIZED_REVIEWER'
    );
  }

  // 6. Prevent self-reviews
  if (userId === listing.ownerId && booking.renterId === listing.ownerId) {
    throw new AppError(
      'You cannot review your own listing',
      400,
      'SELF_REVIEW_NOT_ALLOWED'
    );
  }

  // 7. Check for duplicate review
  const existingReview = await repository.findReviewByBookingAndReviewer(
    input.bookingId,
    userId
  );
  if (existingReview) {
    throw new AppError(
      'You have already reviewed this booking',
      400,
      'DUPLICATE_REVIEW'
    );
  }

  // 8. Determine reviewer type
  const reviewerType = determineReviewerType(
    userId,
    booking.renterId,
    listing.ownerId
  );

  // 9. Calculate overall rating if category ratings provided
  const overallRating = calculateOverallRating(input.rating, input.categoryRatings);

  // 10. Create review data
  const reviewData: NewReview = {
    bookingId: input.bookingId,
    listingId: booking.listingId,
    ownerId: listing.ownerId,
    reviewerId: userId,
    reviewerType,
    rating: overallRating,
    categoryRatings: input.categoryRatings || {},
    comment: input.comment,
    anonymous: true, // Always start as anonymous
  };

  // 11. Create the review
  const review = await repository.createReview(reviewData);

  // 12. Update anonymity status (check if both parties have reviewed)
  await repository.updateAnonymityStatus(input.bookingId);

  // 13. Fetch updated review to get latest anonymity status
  const updatedReview = await repository.findReviewById(review.id);

  return updatedReview;
};

/**
 * Get reviews for a listing with pagination and filtering
 */
export const getListingReviews = async (query: GetReviewsQuery) => {
  if (query.listingId) {
    return await repository.getListingReviews({
      listingId: query.listingId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      category: query.category,
      reviewerType: query.reviewerType,
    });
  }

  throw new AppError('Listing ID is required', 400, 'MISSING_LISTING_ID');
};

/**
 * Get aggregated reviews for an owner across all their listings
 */
export const getOwnerReviews = async (query: GetReviewsQuery) => {
  if (query.ownerId) {
    return await repository.getOwnerReviews({
      ownerId: query.ownerId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      reviewerType: query.reviewerType,
    });
  }

  throw new AppError('Owner ID is required', 400, 'MISSING_OWNER_ID');
};

/**
 * Update an existing review
 * Enforces:
 * - Only reviewer can edit their own review
 * - Edit window: 7 days after creation
 */
export const updateReview = async (
  userId: string,
  reviewId: string,
  input: UpdateReviewInput
) => {
  // 1. Get existing review
  const review = await repository.findReviewById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  }

  // 2. Verify ownership
  if (review.reviewerId !== userId) {
    throw new AppError(
      'You are not authorized to edit this review',
      403,
      'UNAUTHORIZED_EDIT'
    );
  }

  // 3. Check edit window (7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  if (review.createdAt < sevenDaysAgo) {
    throw new AppError(
      'Review edit window has expired (7 days)',
      400,
      'EDIT_WINDOW_EXPIRED'
    );
  }

  // 4. Calculate new overall rating if rating or categories changed
  let overallRating = review.rating;
  if (input.rating !== undefined || input.categoryRatings !== undefined) {
    const newRating = input.rating ?? review.rating;
    const newCategories = input.categoryRatings ?? (review.categoryRatings as Record<string, number>);
    overallRating = calculateOverallRating(newRating, newCategories);
  }

  // 5. Prepare update data
  const updateData: Partial<NewReview> = {};
  if (input.rating !== undefined || input.categoryRatings !== undefined) {
    updateData.rating = overallRating;
  }
  if (input.categoryRatings !== undefined) {
    updateData.categoryRatings = input.categoryRatings;
  }
  if (input.comment !== undefined) {
    updateData.comment = input.comment;
  }

  // 6. Update the review
  const updatedReview = await repository.updateReview(reviewId, updateData);
  
  if (!updatedReview) {
    throw new AppError('Failed to update review', 500, 'UPDATE_FAILED');
  }

  return updatedReview;
};

/**
 * Delete a review
 * Enforces:
 * - Only reviewer can delete their own review
 * - Soft delete for data integrity
 */
export const deleteReview = async (userId: string, reviewId: string) => {
  // 1. Get existing review
  const review = await repository.findReviewById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  }

  // 2. Verify ownership (or admin - implement admin check if needed)
  if (review.reviewerId !== userId) {
    throw new AppError(
      'You are not authorized to delete this review',
      403,
      'UNAUTHORIZED_DELETE'
    );
  }

  // 3. Soft delete the review
  const deleted = await repository.softDeleteReview(reviewId);
  
  if (!deleted) {
    throw new AppError('Failed to delete review', 500, 'DELETE_FAILED');
  }

  return { success: true, message: 'Review deleted successfully' };
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId: string) => {
  const review = await repository.findReviewById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  }
  return review;
};