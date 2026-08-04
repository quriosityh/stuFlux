import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { ListingFormWizard } from '@/components/listing-form/ListingFormWizard';
import type { ListingFormData, PhotoObject } from '@/components/listing-form/types';

type EditableListing = {
  title: string;
  description: string;
  category: { id: number } | null;
  daily_rate: number;
  area: string;
  condition: ListingFormData['condition'] | null;
  rental_rules: string | null;
  specs: Record<string, string> | null;
  min_rental_days: number | null;
  max_rental_days: number | null;
  delivery_available: boolean | null;
  delivery_fee: number | null;
  security_deposit: number | null;
  status: ListingFormData['status'] | 'archived' | null;
  photos: Array<PhotoObject | null>;
};

type BlockedDate = { start_date: string; end_date: string };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in' as never);

  const token = await getToken();
  if (!token) redirect('/auth/sign-in' as never);

  const api = await createServerApiClient(token);

  try {
    const [listingResponse, blockedDatesResponse] = await Promise.all([
      api.get(`listings/owner/${id}`).json<{ data: EditableListing }>(),
      api.get(`listings/${id}/blocked-dates`).json<{ data: BlockedDate[] }>(),
    ]);
    const listing = listingResponse.data;

    if (listing.status === 'archived') redirect('/listings' as never);

    const defaultValues: Partial<ListingFormData> = {
      title: listing.title,
      description: listing.description,
      category_id: listing.category?.id ?? 0,
      daily_rate: listing.daily_rate,
      area: listing.area,
      condition: listing.condition ?? '',
      rental_rules: listing.rental_rules ?? '',
      specs: listing.specs ?? {},
      min_rental_days: listing.min_rental_days ?? 1,
      max_rental_days: listing.max_rental_days ?? 30,
      delivery_available: listing.delivery_available ?? false,
      delivery_fee: listing.delivery_fee ?? 0,
      security_deposit: listing.security_deposit ?? 0,
      status: listing.status ?? 'draft',
      photos: listing.photos.filter((photo): photo is PhotoObject => Boolean(photo?.url)),
      blocked_dates: blockedDatesResponse.data ?? [],
    };

    return <ListingFormWizard mode="edit" listingId={id} defaultValues={defaultValues} />;
  } catch {
    redirect('/listings' as never);
  }
}
