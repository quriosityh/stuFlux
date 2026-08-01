import { differenceInCalendarDays } from 'date-fns';
import { AppError } from '../../common/errors.js';
import { listingsRepository } from '../listings/infrastructure/repository.js';
import { createBookingSchema } from './validations.js';
import { bookingsRepository } from './repository.js';
import { messagesRepository } from '../messages/repository.js';
import { usersRepository } from '../users/repository.js';
import { notificationEmitter, type NotificationEvent } from '../../infra/events/notificationEmitter.js';
import { sendPushToUser } from '../../infra/push/sender.js';
import { bookingConfirmedEmail, bookingRejectedEmail, bookingRequestEmail } from '../../infra/email/templates.js';
import { sendEmail } from '../../infra/email/sender.js';
import type { BookingStatus } from './types.js';

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];

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

  // Also check if dates overlap with manual blocked dates
  const blockedDates = await listingsRepository.getBlockedDates(data.listing_id);
  const requestedStart = data.start_date.getTime();
  const requestedEnd = data.end_date.getTime();
  const hasBlockedOverlap = blockedDates.some((range) => {
    const rangeStart = new Date(range.start_date).getTime();
    const rangeEnd = new Date(range.end_date).getTime();
    return rangeStart < requestedEnd && rangeEnd > requestedStart;
  });
  if (hasBlockedOverlap) {
    throw new AppError('Dates are blocked by the owner', 400, 'BOOKING_DATES_BLOCKED');
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

  // ── Wire the conversation ────────────────────────────────────────────────
  const conversation = await messagesRepository.attachOrCreateConversation(
    booking.id,
    booking.listing_id,
    renterId,
    listing.owner.id,
  );

  const startStr  = booking.start_date;
  const endStr    = booking.end_date;
  const totalRs   = Math.round(totalAmount / 100).toLocaleString('en-PK');
  const systemMsg = `📋 Booking request submitted · ${startStr} – ${endStr} · Rs. ${totalRs}`;
  await messagesRepository.addMessage(conversation!.id, renterId, systemMsg);
  // ────────────────────────────────────────────────────────────────────────

  const renterName = await usersRepository.findDisplayName(renterId);
  const renterEmail = await usersRepository.findEmailById(renterId);
  notificationEmitter.emit(`user:${listing.owner.id}`, {
    type: 'booking_request',
    bookingId: booking.id,
    listingTitle: listing.title,
    renterName: renterName ?? 'A renter',
    startDate: booking.start_date,
    endDate: booking.end_date,
    conversationId: conversation!.id,
  } satisfies NotificationEvent);
  void sendPushToUser(listing.owner.id, {
    type: 'booking_request',
    title: 'New Rental Request',
    body: `${renterName ?? 'A renter'} wants to rent your ${listing.title}`,
    url: '/bookings',
  });

  if (listing.owner.email && renterEmail?.display_name) {
    void sendEmail({
      to: listing.owner.email,
      ...bookingRequestEmail({
        lenderName: listing.owner.display_name,
        renterName: renterEmail.display_name,
        listingTitle: listing.title,
        startDate: booking.start_date,
        endDate: booking.end_date,
      }),
    });
  }

  return { booking, conversation_id: conversation!.id };
};

export const confirmBooking = async (bookingId: string, ownerId: string) => {
  const result = await bookingsRepository.findById(bookingId);
  if (!result) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  const booking = result.booking;
  if (booking.owner_id !== ownerId) throw new AppError('Not allowed', 403, 'FORBIDDEN');
  if (booking.status !== 'pending') throw new AppError('Booking is not pending', 400, 'BOOKING_NOT_PENDING');

  const hasConfirmedOverlap = await bookingsRepository.checkConfirmedOverlap(
    booking.listing_id,
    new Date(booking.start_date),
    new Date(booking.end_date)
  );
  if (hasConfirmedOverlap) {
    throw new AppError('Dates already booked', 400, 'BOOKING_DATES_UNAVAILABLE');
  }

  const blockedDates = await listingsRepository.getBlockedDates(booking.listing_id);
  const bookingStart = new Date(booking.start_date).getTime();
  const bookingEnd = new Date(booking.end_date).getTime();
  const hasBlockedOverlap = blockedDates.some((range) => {
    const rangeStart = new Date(range.start_date).getTime();
    const rangeEnd = new Date(range.end_date).getTime();
    return rangeStart < bookingEnd && rangeEnd > bookingStart;
  });
  if (hasBlockedOverlap) {
    throw new AppError('Dates are blocked by the owner', 400, 'BOOKING_DATES_BLOCKED');
  }

  let updated;
  try {
    // The exclusion constraint added in migration 0007 is the final, atomic
    // guard against a competing confirmation for the same dates.
    updated = await bookingsRepository.updateStatus(bookingId, 'confirmed', 'confirmed_at');
  } catch (error: unknown) {
    if (isExclusionViolation(error)) {
      throw new AppError('Dates already booked', 409, 'BOOKING_DATES_UNAVAILABLE');
    }
    throw error;
  }
  if (updated) {
    await bookingsRepository.incrementListingBookingCount(booking.listing_id);

    const [listing, conversation] = await Promise.all([
      listingsRepository.findById(booking.listing_id),
      messagesRepository.findConversationByBookingId(bookingId),
    ]);
    notificationEmitter.emit(`user:${booking.renter_id}`, {
      type: 'booking_confirmed',
      bookingId: booking.id,
      listingTitle: listing?.title ?? '',
      lenderName: listing?.owner?.display_name ?? '',
      startDate: booking.start_date,
      endDate: booking.end_date,
      conversationId: conversation?.id ?? '',
    } satisfies NotificationEvent);
    void sendPushToUser(booking.renter_id, {
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      body: `Your booking for ${listing?.title ?? 'this listing'} was confirmed`,
      url: '/bookings',
    });

    const renter = await usersRepository.findEmailById(booking.renter_id);
    if (renter?.email) {
      void sendEmail({
        to: renter.email,
        ...bookingConfirmedEmail({
          renterName: renter.display_name,
          listingTitle: listing?.title ?? '',
          lenderName: listing?.owner?.display_name ?? '',
          startDate: booking.start_date,
          endDate: booking.end_date,
        }),
      });
    }
  }
  return updated;
};

function isExclusionViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23P01';
}

export const rejectBooking = async (bookingId: string, ownerId: string) => {
  const result = await bookingsRepository.findById(bookingId);
  if (!result) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  const booking = result.booking;
  if (booking.owner_id !== ownerId) throw new AppError('Not allowed', 403, 'FORBIDDEN');
  if (booking.status !== 'pending') throw new AppError('Booking is not pending', 400, 'BOOKING_NOT_PENDING');

  const updated = await bookingsRepository.updateStatus(bookingId, 'rejected', 'rejected_at');
  if (updated) {
    const listing = await listingsRepository.findById(booking.listing_id);
    notificationEmitter.emit(`user:${booking.renter_id}`, {
      type: 'booking_rejected',
      bookingId: booking.id,
      listingTitle: listing?.title ?? '',
      startDate: booking.start_date,
      endDate: booking.end_date,
    } satisfies NotificationEvent);
    void sendPushToUser(booking.renter_id, {
      type: 'booking_rejected',
      title: 'Booking Request Declined',
      body: `Your booking for ${listing?.title ?? 'this listing'} was declined`,
      url: '/bookings',
    });

    const renter = await usersRepository.findEmailById(booking.renter_id);
    if (renter?.email) {
      void sendEmail({
        to: renter.email,
        ...bookingRejectedEmail({
          renterName: renter.display_name,
          listingTitle: listing?.title ?? '',
          startDate: booking.start_date,
          endDate: booking.end_date,
        }),
      });
    }
  }
  return updated;
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  const result = await bookingsRepository.findById(bookingId);
  if (!result) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  const booking = result.booking;

  if (booking.renter_id !== userId && booking.owner_id !== userId) {
    throw new AppError('Not allowed to cancel this booking', 403, 'FORBIDDEN');
  }
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new AppError('Only pending or confirmed bookings can be cancelled', 400, 'INVALID_BOOKING_STATE');
  }

  const updated = await bookingsRepository.updateStatus(bookingId, 'cancelled', 'cancelled_at');
  if (updated) {
    const counterpartId = userId === booking.renter_id ? booking.owner_id : booking.renter_id;
    void sendPushToUser(counterpartId, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: `Booking for ${result.listing.title} was cancelled`,
      url: '/bookings',
    });
  }
  return updated;
};

export const completeBooking = async (bookingId: string, userId: string) => {
  const result = await bookingsRepository.findById(bookingId);
  if (!result) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  const booking = result.booking;

  if (booking.owner_id !== userId) {
    throw new AppError('Only the listing owner can complete this booking', 403, 'FORBIDDEN');
  }
  if (booking.status !== 'confirmed') {
    throw new AppError('Only confirmed bookings can be completed', 400, 'INVALID_BOOKING_STATE');
  }

  const updated = await bookingsRepository.updateStatus(bookingId, 'completed', 'completed_at');
  return updated;
};

export const getBookings = async (
  userId: string,
  role: 'renter' | 'owner',
  status?: BookingStatus,
  listingId?: string,
  limit = 50
) => {
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError('Invalid status filter', 400, 'INVALID_STATUS');
  }
  const rawRows = await bookingsRepository.findForUser(userId, role, status, listingId, limit);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawRows.map((row) => {
    const { booking, listing, renter, owner, conversation_id } = row;
    const isLender = role === 'owner';
    const counterpartUser = isLender ? renter : owner;

    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    let phase = booking.status as string;
    if (booking.status === 'confirmed') {
      if (today >= startDate && today <= endDate) {
        phase = 'active';
      } else if (today > endDate) {
        phase = 'completed';
      } else {
        phase = 'confirmed';
      }
    }

    return {
      id: booking.id,
      phase,
      status: booking.status,
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalDays: booking.total_days,
      deliveryType: listing?.delivery_available ? 'delivery' : 'pickup',
      message: booking.message,
      listing: {
        id: listing?.id,
        title: listing?.title || 'Listing',
        dailyRate: listing?.daily_rate || 0,
        area: listing?.area || 'Lahore',
        image: listing?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
        rules: listing?.rental_rules ? [listing.rental_rules] : [],
      },
      counterpart: {
        id: counterpartUser?.id,
        name: counterpartUser?.display_name || 'User',
        avatar: counterpartUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        rating: 4.9,
        phone: '+92 300 1234567',
        joined: '2024',
        completedRentals: 5,
      },
      financials: {
        rentTotal: booking.total_amount,
        deliveryFee: booking.delivery_fee,
        securityDeposit: booking.security_deposit,
      },
      conversation_id: conversation_id || null,
      created_at: booking.created_at,
    };
  });
};

export const getAvailability = async (listingId: string) => {
  const [confirmedBookings, blockedDates] = await Promise.all([
    bookingsRepository.getAvailability(listingId),
    listingsRepository.getBlockedDates(listingId),
  ]);

  const combined = [
    ...confirmedBookings.map((b) => ({
      start_date: b.start_date,
      end_date: b.end_date,
      status: 'confirmed' as const,
    })),
    ...blockedDates.map((d) => ({
      start_date: d.start_date,
      end_date: d.end_date,
      status: 'blocked' as const,
    })),
  ];

  return combined.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
};
