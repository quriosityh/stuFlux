import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { PublicProfileClient } from '@/components/profile/PublicProfileClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerApiClient();
  try {
    const res = await api.get(`users/${id}`).json<{ data: any }>();
    if (res.data) {
      return {
        title: `${res.data.display_name} · StuFlux Profile`,
        description: `View student storefront, listings, and reputation for ${res.data.display_name}.`,
      };
    }
  } catch {}
  return { title: 'Student Profile · StuFlux' };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerApiClient();

  // Fetch profile first — 404 fast if not found
  let profile: any = null;
  try {
    const res = await api.get(`users/${id}`).json<{ data: any }>();
    profile = res.data ?? null;
  } catch {
    notFound();
  }
  if (!profile) notFound();

  // Fan out listings + reviews in parallel — both are public, no auth required
  const [listingsRes, reviewsRes] = await Promise.allSettled([
    api.get(`listings?ownerId=${id}&status=active&limit=50`).json<any>(),
    // Correct endpoint: /reviews?targetId=X (not /users/:id/reviews)
    api.get(`reviews?targetId=${id}&limit=50`).json<any>(),
  ]);

  const listings = listingsRes.status === 'fulfilled'
    ? (listingsRes.value?.data ?? listingsRes.value ?? [])
    : [];

  const reviews = reviewsRes.status === 'fulfilled'
    ? (reviewsRes.value?.data?.reviews ?? reviewsRes.value?.data ?? [])
    : [];

  return (
    <PublicProfileClient
      profile={profile}
      listings={listings}
      reviews={reviews}
    />
  );
}
