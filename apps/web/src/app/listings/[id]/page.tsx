import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import PDPClient from '@/components/pdp/PDPClient';
import { auth } from '@clerk/nextjs/server';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let listing = null;
  let availability: any[] = [];

  try {
    const res = await api.get(`listings/${id}`).json<{ data: any }>();
    listing = res.data ?? null;
  } catch {
    // listing not found or API error → show 404
  }

  if (!listing) return notFound();

  try {
    const res = await api
      .get(`bookings/listings/${id}/availability`)
      .json<{ data: any[] }>();
    availability = res.data ?? [];
  } catch {
    // availability fetch failed — continue without it (calendar shows all open)
  }

  return (
    <div className="bg-background min-h-screen">
      <PDPClient listing={listing} availability={availability} />
    </div>
  );
}
