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

  const profilePromise = api.get('users/me').json<{ data: any }>().catch(() => null);
  const listingsPromise = api.get('listings/owner/my?limit=50').json<any>().catch(() => null);
  const ownerBookingsPromise = api.get('bookings?role=owner&limit=100').json<any>().catch(() => null);
  const renterBookingsPromise = api.get('bookings?role=renter&limit=100').json<any>().catch(() => null);

  const [profileRes, listingsRes, ownerRes, renterRes] = await Promise.all([
    profilePromise,
    listingsPromise,
    ownerBookingsPromise,
    renterBookingsPromise
  ]);

  const profile = profileRes?.data ?? null;
  const listings = listingsRes || { data: [], meta: { total: 0 } };
  
  const ownerData = ownerRes?.data ? ownerRes.data.map((b: any) => ({ ...b, role: 'owner' })) : [];
  const renterData = renterRes?.data ? renterRes.data.map((b: any) => ({ ...b, role: 'renter' })) : [];
  const bookings = { data: [...ownerData, ...renterData] };

  let reviews: any[] = [];
  if (profile?.id) {
    try {
      const res = await api.get(`users/${profile.id}/reviews`).json<any>();
      reviews = res.data?.reviews || res.data || [];
    } catch {
      reviews = [];
    }
  }

  return (
    <ProfileClient
      initialProfile={profile}
      initialBookings={bookings.data ?? []}
      initialReviews={reviews}
    />
  );
}
