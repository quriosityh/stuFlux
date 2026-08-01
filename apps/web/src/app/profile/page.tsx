import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const metadata = {
  title: 'My Profile · StuFlux',
  description: 'Manage your listings, track your rental history, and update your profile.',
};

export default async function ProfilePage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in' as any);

  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let profile = null;
  let listings: { data: any[]; meta: { total: number } } = { data: [], meta: { total: 0 } };
  let bookings: { data: any[] } = { data: [] };
  let reviews: any[] = [];

  try {
    const res = await api.get('users/me').json<{ data: any }>();
    profile = res.data ?? null;
  } catch {
    // fallback
  }

  if (profile?.id) {
    try {
      const res = await api.get(`users/${profile.id}/reviews`).json<any>();
      reviews = res.data?.reviews || res.data || [];
    } catch {
      reviews = [];
    }
  }

  try {
    const res = await api.get('listings/owner/my?limit=50').json<any>();
    listings = res;
  } catch {
    // empty state
  }

  try {
    // Fetch both roles for accurate stats
    const [ownerRes, renterRes] = await Promise.allSettled([
      api.get('bookings?role=owner&limit=100').json<any>(),
      api.get('bookings?role=renter&limit=100').json<any>(),
    ]);
    const ownerData = ownerRes.status === 'fulfilled' ? (ownerRes.value?.data ?? []).map((b: any) => ({ ...b, role: 'owner' })) : [];
    const renterData = renterRes.status === 'fulfilled' ? (renterRes.value?.data ?? []).map((b: any) => ({ ...b, role: 'renter' })) : [];
    bookings = { data: [...ownerData, ...renterData] };
  } catch {
    // empty state
  }

  return (
    <ProfileClient
      initialProfile={profile}
      initialBookings={bookings.data ?? []}
      initialReviews={reviews}
      initialListings={listings}
    />
  );
}
