import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { fetchOwnerBookings, fetchOwnerListings } from '@/lib/listings/api';
import { ListingsClient } from '@/components/listings/ListingsClient';
import type { OwnerBookingSnapshot, OwnerListing } from '@/lib/listings/types';

export const metadata = {
  title: 'My Listings · StuFlux',
  description: 'Manage your storefront inventory, pricing, and item availability.',
};

export default async function ListingsPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in' as any);

  const token = await getToken();

  if (!token) {
    return (
      <ListingsClient
        initialListings={[]}
        initialBookings={[]}
        initialError={null}
      />
    );
  }

  const api = await createServerApiClient(token ?? undefined);

  let listings: OwnerListing[] = [];
  let bookings: OwnerBookingSnapshot[] = [];
  let loadError: string | null = null;

  try {
    const [fetchedListings, fetchedBookings] = await Promise.all([
      fetchOwnerListings(api).catch((err) => {
        console.error('Error fetching owner listings on server:', err);
        loadError = 'Could not load your listings. Please refresh the page.';
        return [];
      }),
      fetchOwnerBookings(api).catch((err) => {
        console.error('Error fetching owner bookings on server:', err);
        return [];
      }),
    ]);
    listings = fetchedListings;
    bookings = fetchedBookings;
  } catch (err) {
    console.error('Unexpected error fetching listings page data:', err);
  }

  return (
    <ListingsClient
      initialListings={listings}
      initialBookings={bookings}
      initialError={loadError}
    />
  );
}
