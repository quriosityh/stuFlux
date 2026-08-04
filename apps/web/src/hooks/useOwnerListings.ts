'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiClient } from '@/lib/api-client';
import {
  fetchOwnerBookings,
  fetchOwnerListings,
} from '@/lib/listings/api';
import {
  buildOutOnRentalMap,
  buildPendingCountsMap,
} from '@/lib/listings/booking-utils';
import type { ListingFilter, OwnerBookingSnapshot, OwnerListing } from '@/lib/listings/types';

interface UseOwnerListingsOptions {
  initialListings: OwnerListing[];
  initialBookings: OwnerBookingSnapshot[];
}

export function useOwnerListings({
  initialListings,
  initialBookings,
}: UseOwnerListingsOptions) {
  const api = useApiClient();
  const [listings, setListings] = useState<OwnerListing[]>(initialListings);
  const [bookings, setBookings] = useState<OwnerBookingSnapshot[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListingFilter>('all');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextListings, nextBookings] = await Promise.all([
        fetchOwnerListings(api),
        fetchOwnerBookings(api),
      ]);
      setListings(nextListings);
      setBookings(nextBookings);
    } catch (err) {
      console.error('Error refreshing owner listings:', err);
      setError('Could not refresh listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const pendingCountsMap = useMemo(() => buildPendingCountsMap(bookings), [bookings]);
  const outOnRentalMap = useMemo(() => buildOutOnRentalMap(bookings), [bookings]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.status !== 'archived')
      .filter((l) => {
        if (filter === 'active') return l.status === 'active';
        if (filter === 'paused') return l.status === 'inactive';
        return true;
      });
  }, [listings, filter]);

  const activeCount = useMemo(
    () => listings.filter((l) => l.status === 'active').length,
    [listings]
  );
  const pausedCount = useMemo(
    () => listings.filter((l) => l.status === 'inactive').length,
    [listings]
  );
  const pendingRequestsTotal = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings]
  );

  const patchListing = useCallback((listingId: string, patch: Partial<OwnerListing>) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, ...patch } : l))
    );
  }, []);

  const removeListing = useCallback((listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  }, []);

  return {
    listings,
    bookings,
    loading,
    error,
    filter,
    setFilter,
    refresh,
    patchListing,
    removeListing,
    filteredListings,
    pendingCountsMap,
    outOnRentalMap,
    activeCount,
    pausedCount,
    pendingRequestsTotal,
  };
}
