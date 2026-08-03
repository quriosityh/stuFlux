import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { ListingsClient } from '@/components/listings/ListingsClient';

export const metadata = {
  title: 'My Listings · StuFlux',
  description: 'Manage your storefront inventory, pricing, and item availability.',
};

export default async function ListingsPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in' as any);

  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let listings: any[] = [];
  let bookings: any[] = [];

  try {
    const listingsRes = await api.get('listings/owner/my?limit=100').json<{ data: any[] }>();
    listings = listingsRes.data || [];
  } catch (err) {
    console.error('Error fetching owner listings on server:', err);
  }

  try {
    const bookingsRes = await api.get('bookings?role=owner&limit=200').json<{ data: any[] }>();
    bookings = bookingsRes.data || [];
  } catch (err) {
    console.error('Error fetching owner bookings on server:', err);
  }

  return (
    <ListingsClient
      initialListings={listings}
      initialBookings={bookings}
    />
  );
}
