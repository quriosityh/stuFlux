import type { OwnerBookingSnapshot } from './types';

function parseDate(value: string): Date {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isConfirmedBookingActiveOrUpcoming(booking: OwnerBookingSnapshot): boolean {
  if (booking.status !== 'confirmed') return false;
  const end = parseDate(booking.endDate);
  return end >= today();
}

export function isListingOutOnRental(
  listingId: string,
  bookings: OwnerBookingSnapshot[]
): boolean {
  const now = today();
  return bookings.some((b) => {
    if (b.listing.id !== listingId || b.status !== 'confirmed') return false;
    const start = parseDate(b.startDate);
    const end = parseDate(b.endDate);
    return now >= start && now <= end;
  });
}

export function buildPendingCountsMap(
  bookings: OwnerBookingSnapshot[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const booking of bookings) {
    if (booking.status !== 'pending') continue;
    const id = booking.listing.id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export function buildOutOnRentalMap(
  bookings: OwnerBookingSnapshot[]
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const booking of bookings) {
    if (booking.status !== 'confirmed') continue;
    const now = today();
    const start = parseDate(booking.startDate);
    const end = parseDate(booking.endDate);
    if (now >= start && now <= end) {
      map[booking.listing.id] = true;
    }
  }
  return map;
}

export function listingHasActiveOrUpcomingBookings(
  listingId: string,
  bookings: OwnerBookingSnapshot[]
): boolean {
  return bookings.some(
    (b) => b.listing.id === listingId && isConfirmedBookingActiveOrUpcoming(b)
  );
}

export function dateRangesOverlap(
  a: { start_date: string; end_date: string },
  b: { start_date: string; end_date: string }
): boolean {
  return a.start_date <= b.end_date && a.end_date >= b.start_date;
}

export function rangeOverlapsAnyConfirmedBooking(
  range: { start_date: string; end_date: string },
  confirmedRanges: { start_date: string; end_date: string }[]
): boolean {
  return confirmedRanges.some((confirmed) => dateRangesOverlap(range, confirmed));
}
