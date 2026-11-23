import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { ProfileClient, type Booking, type Profile, type Review } from '@/components/profile/ProfileClient';

export const metadata = {
  title: 'My Profile · StuFlux',
  description: 'Manage your listings, track your rental history, and update your profile.',
};

/**
 * The bookings endpoint is optimized for the bookings UI. Normalize its
 * camelCase/nested financial fields for the profile's history and earnings UI.
 */
type ApiBooking = {
  id: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  financials?: { rentTotal?: number; deliveryFee?: number };
  listing?: { id?: string; title?: string; image?: string };
  counterpart?: { name?: string };
};

type ApiData<T> = { data: T };

function toProfileBooking(booking: ApiBooking, role: 'owner' | 'renter'): Booking {
  const counterpart = booking.counterpart;

  return {
    id: booking.id,
    role,
    status: booking.status,
    start_date: booking.startDate,
    end_date: booking.endDate,
    total_amount: booking.financials?.rentTotal ?? 0,
    delivery_fee: booking.financials?.deliveryFee ?? 0,
    listing: {
      id: booking.listing?.id ?? booking.id,
      title: booking.listing?.title ?? 'Listing',
      photo: booking.listing?.image ? { url: booking.listing.image } : null,
    },
    ...(role === 'owner'
      ? { renter: { display_name: counterpart?.name ?? 'Student' } }
      : { owner: { display_name: counterpart?.name ?? 'Owner' } }),
  };
}

export default async function ProfilePage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in');

  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  // 1. Fetch profile first — we need the DB user ID for subsequent calls
  let profile: Profile | null = null;
  try {
    const res = await api.get('users/me').json<ApiData<Profile>>();
    profile = res.data ?? null;
  } catch {
    // Profile load failed — render empty state
  }

  // 2. Fan out remaining calls in parallel — all depend on profile.id
  const dbUserId = profile?.id;

  const [bookingOwnerRes, bookingRenterRes, reviewsRes] = await Promise.allSettled([
    dbUserId ? api.get('bookings?role=owner&limit=100').json<ApiData<ApiBooking[]>>()  : Promise.resolve(null),
    dbUserId ? api.get('bookings?role=renter&limit=100').json<ApiData<ApiBooking[]>>() : Promise.resolve(null),
    // Reviews are queried on the reviews endpoint with targetId — NOT /users/:id/reviews
    dbUserId ? api.get(`reviews?targetId=${dbUserId}&limit=50`).json<ApiData<{ reviews?: Review[] } | Review[]>>() : Promise.resolve(null),
  ]);

  const ownerBookings  = bookingOwnerRes.status  === 'fulfilled' && bookingOwnerRes.value
    ? (bookingOwnerRes.value.data ?? []).map((b) => toProfileBooking(b, 'owner'))
    : [];
  const renterBookings = bookingRenterRes.status === 'fulfilled' && bookingRenterRes.value
    ? (bookingRenterRes.value.data ?? []).map((b) => toProfileBooking(b, 'renter'))
    : [];
  const reviews = reviewsRes.status === 'fulfilled' && reviewsRes.value
    ? (Array.isArray(reviewsRes.value.data)
      ? reviewsRes.value.data
      : reviewsRes.value.data.reviews ?? [])
    : [];

  return (
    <ProfileClient
      initialProfile={profile}
      initialBookings={[...ownerBookings, ...renterBookings]}
      initialReviews={reviews}
    />
  );
}
