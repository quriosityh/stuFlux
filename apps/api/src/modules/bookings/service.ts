import { differenceInCalendarDays } from 'date-fns';
import { AppError } from '../../common/errors.js';
import { listingsRepository } from '../listings/infrastructure/repository.js';
import { createBookingSchema } from './validations.js';
import { bookingsRepository } from './repository.js';
import type { BookingStatus } from './types.js';

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'completed'];

export const createBooking = async (payload: unknown, renterId: string) => {
  const data = createBookingSchema.parse(payload);

  const listing = await listingsRepository.findById(data.listing_id);
  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (!listing.owner) throw new AppError('Listing has no owner', 500, 'LISTING_NO_OWNER');
  if (listing.owner.id === renterId) {
    throw new AppError('Owners cannot book their own listing', 400, 'BOOKING_OWNER_NOT_ALLOWED');
  }
  if (listing.status !== 'active') {
    throw new AppError('Listing not available for booking', 400, 'LISTING_NOT_AVAILABLE');
  }

  const days = differenceInCalendarDays(data.end_date, data.start_date);
  if (days < (listing.min_rental_days || 1)) {
    throw new AppError('Booking shorter than minimum rental days', 400, 'BOOKING_TOO_SHORT');
  }
  if (days > (listing.max_rental_days || 30)) {
    throw new AppError('Booking longer than maximum rental days', 400, 'BOOKING_TOO_LONG');
  }

  // Only confirmed bookings lock dates; we allow pending overlaps, but prevent double-confirm later.
  const hasConfirmedOverlap = await bookingsRepository.checkConfirmedOverlap(
    data.listing_id,
    data.start_date,
    data.end_date
  );
  if (hasConfirmedOverlap) {
    throw new AppError('Dates already booked', 400, 'BOOKING_DATES_UNAVAILABLE');
  }

  const totalAmount = days * listing.daily_rate;
  const booking = await bookingsRepository.create({
    data,
    renterId,
    ownerId: listing.owner.id,
    totalDays: days,
    totalAmount,
    securityDeposit: listing.security_deposit || 0,
    deliveryFee: listing.delivery_fee || 0,
  });

  return booking;
};

export const confirmBooking = async (bookingId: string, ownerId: string) => {
  const booking = await bookingsRepository.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  if (booking.owner_id !== ownerId) throw new AppError('Not allowed', 403, 'FORBIDDEN');
  if (booking.status !== 'pending') throw new AppError('Booking is not pending', 400, 'BOOKING_NOT_PENDING');

  const hasConfirmedOverlap = await bookingsRepository.checkConfirmedOverlap(
    booking.listing_id,
    booking.start_date,
    booking.end_date
  );
  if (hasConfirmedOverlap) {
    throw new AppError('Dates already booked', 400, 'BOOKING_DATES_UNAVAILABLE');
  }

  const updated = await bookingsRepository.updateStatus(bookingId, 'confirmed', 'confirmed_at');
  if (updated) {
    await bookingsRepository.incrementListingBookingCount(booking.listing_id);
  }
  return updated;
};

export const rejectBooking = async (bookingId: string, ownerId: string) => {
  const booking = await bookingsRepository.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  if (booking.owner_id !== ownerId) throw new AppError('Not allowed', 403, 'FORBIDDEN');
  if (booking.status !== 'pending') throw new AppError('Booking is not pending', 400, 'BOOKING_NOT_PENDING');

  return bookingsRepository.updateStatus(bookingId, 'rejected', 'rejected_at');
};

export const getBookings = async (
  userId: string,
  role: 'renter' | 'owner',
  status?: BookingStatus,
  listingId?: string
) => {
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError('Invalid status filter', 400, 'INVALID_STATUS');
  }
  return bookingsRepository.findForUser(userId, role, status, listingId);
};

export const getAvailability = async (listingId: string) => {
  return bookingsRepository.getAvailability(listingId);
};
