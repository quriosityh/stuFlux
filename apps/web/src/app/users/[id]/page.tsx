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
        description: `View student storefront, listings, and rental reputation ratings for ${res.data.display_name}.`,
      };
    }
  } catch {}
  return {
    title: 'Student Profile · StuFlux',
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerApiClient();

  let profile = null;
  let listings: any[] = [];
  let reviews: any[] = [];

  try {
    const res = await api.get(`users/${id}`).json<{ data: any }>();
    profile = res.data ?? null;
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  try {
    const listingsRes = await api.get(`listings?ownerId=${id}&status=active`).json<any>();
    listings = listingsRes.data || listingsRes || [];
  } catch {
    listings = [];
  }

  try {
    const reviewsRes = await api.get(`users/${id}/reviews`).json<any>();
    reviews = reviewsRes.data?.reviews || reviewsRes.data || [];
  } catch {
    reviews = [];
  }

  return (
    <PublicProfileClient
      profile={profile}
      listings={listings}
      reviews={reviews}
    />
  );
}
