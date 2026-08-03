import type { KyInstance } from 'ky';
import type {
  BlockedDateRange,
  ListingAvailabilityRange,
  OwnerBookingSnapshot,
  OwnerListing,
} from './types';

const OWNER_LISTINGS_LIMIT = 50;
const OWNER_BOOKINGS_LIMIT = 200;

export async function fetchOwnerListings(api: KyInstance): Promise<OwnerListing[]> {
  const res = await api
    .get(`listings/owner/my?limit=${OWNER_LISTINGS_LIMIT}`)
    .json<{ data: OwnerListing[] }>();
  return res.data ?? [];
}

export async function fetchOwnerBookings(api: KyInstance): Promise<OwnerBookingSnapshot[]> {
  const res = await api
    .get(`bookings?role=owner&limit=${OWNER_BOOKINGS_LIMIT}`)
    .json<{ data: OwnerBookingSnapshot[] }>();
  return res.data ?? [];
}

export async function fetchListingAvailability(
  api: KyInstance,
  listingId: string
): Promise<ListingAvailabilityRange[]> {
  const res = await api
    .get(`bookings/listings/${listingId}/availability`)
    .json<{ data: ListingAvailabilityRange[] }>();
  return res.data ?? [];
}

export async function updateListingDailyRate(
  api: KyInstance,
  listingId: string,
  dailyRatePaisa: number
): Promise<void> {
  await api.put(`listings/${listingId}`, {
    json: { daily_rate: dailyRatePaisa },
  });
}

export async function updateListingStatus(
  api: KyInstance,
  listingId: string,
  status: 'active' | 'inactive' | 'archived'
): Promise<void> {
  await api.put(`listings/${listingId}`, {
    json: { status },
  });
}

export async function fetchBlockedDates(
  api: KyInstance,
  listingId: string
): Promise<BlockedDateRange[]> {
  const res = await api
    .get(`listings/${listingId}/blocked-dates`)
    .json<{ data: BlockedDateRange[] }>();
  return res.data ?? [];
}

export async function saveBlockedDates(
  api: KyInstance,
  listingId: string,
  blockedDates: BlockedDateRange[]
): Promise<void> {
  await api.put(`listings/${listingId}/blocked-dates`, {
    json: { blocked_dates: blockedDates },
  });
}

export async function fetchListingOwnerBookings(
  api: KyInstance,
  listingId: string
): Promise<OwnerBookingSnapshot[]> {
  const res = await api
    .get('bookings', {
      searchParams: { role: 'owner', listing_id: listingId, limit: 100 },
    })
    .json<{ data: OwnerBookingSnapshot[] }>();
  return res.data ?? [];
}

/** Async helper — resolves API error text from ky HTTPError */
export async function readApiError(err: unknown, fallback: string): Promise<string> {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: Response }).response;
    if (response) {
      try {
        const body = (await response.json()) as { message?: string; error?: { message?: string } };
        return body.message ?? body.error?.message ?? fallback;
      } catch {
        return fallback;
      }
    }
  }
  return fallback;
}
