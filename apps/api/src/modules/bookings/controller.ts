import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest, optionalAuth } from '../../infra/http/middleware/auth.js';
import { createBooking, confirmBooking, rejectBooking, cancelBooking, completeBooking, getBookings, getAvailability } from './service.js';
import { bookingsRepository } from './repository.js';
import { Request, Response } from 'express';
import { AppError } from '../../common/errors.js';

export const createBookingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const booking = await createBooking(req.body, req.auth!.userId);
    res.status(201).json({ data: booking });
  }),
];

export const confirmBookingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const booking = await confirmBooking(id, req.auth!.userId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    res.json({ data: booking });
  }),
];

export const rejectBookingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const booking = await rejectBooking(id, req.auth!.userId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    res.json({ data: booking });
  }),
];

export const cancelBookingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const booking = await cancelBooking(id, req.auth!.userId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    res.json({ data: booking });
  }),
];

export const completeBookingHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const booking = await completeBooking(id, req.auth!.userId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    res.json({ data: booking });
  }),
];

export const listBookingsHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const role = (req.query.role as string) === 'owner' ? 'owner' : 'renter';
    const status = req.query.status as any;
    const listingId = req.query.listing_id as string | undefined;
    const limit = req.query.limit ? Math.min(Number(req.query.limit), 200) : 50;
    const bookings = await getBookings(req.auth!.userId, role, status, listingId, limit);
    res.json({ data: bookings });
  }),
];

export const getBookingByIdHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const booking = await bookingsRepository.findById(id);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    if (booking.booking.renter_id !== req.auth!.userId && booking.booking.owner_id !== req.auth!.userId) {
      // Do not disclose whether a booking exists to users outside the rental.
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    res.json({ data: booking });
  }),
];

export const availabilityHandler = [
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ranges = await getAvailability(id);
    res.json({ data: ranges });
  }),
];
