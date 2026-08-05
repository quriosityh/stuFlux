import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createServerApiClient } from '@/lib/api-client';
import { ListingFormWizard } from '@/components/listing-form/ListingFormWizard';
import type { ListingFormData, PhotoObject } from '@/components/listing-form/types';

type ListingDetails = {
  title?: string;
  description?: string;
  category?: { id?: number | null } | null;
  daily_rate?: number;
  area?: string;
  condition?: ListingFormData['condition'];
  rental_rules?: string;
  specs?: Record<string, string>;
  min_rental_days?: number;
  max_rental_days?: number;
  delivery_available?: boolean;
  delivery_fee?: number;
  security_deposit?: number;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  photos?: Array<PhotoObject & { width?: number; height?: number; size_kb?: number; mime_type?: string }>;
};

type BlockedRange = { start_date: string; end_date: string };

const fromPaisa = (amount: number | undefined) => Math.round((amount ?? 0) / 100);

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in');

  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let defaultValues: Partial<ListingFormData> = {};
  try {
    const [res, blockedDatesResponse] = await Promise.all([
      api.get(`listings/${id}`).json<{ data: ListingDetails }>(),
      api.get(`listings/${id}/blocked-dates`).json<{ data: BlockedRange[] }>(),
    ]);
    const l = res.data;
    if (!l) redirect('/');

    defaultValues = {
      title: l.title ?? '',
      description: l.description ?? '',
      category_id: l.category?.id ?? 0,
      daily_rate: fromPaisa(l.daily_rate),
      area: l.area ?? '',
      condition: l.condition ?? '',
      rental_rules: l.rental_rules ?? '',
      specs: l.specs ?? {},
      min_rental_days: l.min_rental_days ?? 1,
      max_rental_days: l.max_rental_days ?? 30,
      delivery_available: l.delivery_available ?? false,
      delivery_fee: fromPaisa(l.delivery_fee),
      security_deposit: fromPaisa(l.security_deposit),
      // Map existing photo rows → PhotoObject[] so the wizard can show and re-submit them
      photos: (l.photos ?? []).map((p) => ({
        url: p.url,
        secure_url: p.url,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        size_kb: p.size_kb ?? undefined,
        mime_type: p.mime_type ?? undefined,
      })).filter((p) => Boolean(p.url)),
      blocked_dates: blockedDatesResponse.data ?? [],
      status: l.status === 'active' ? 'active' : 'draft',
    };
  } catch {
    redirect('/profile' as Route);
  }

  return (
    <main>
      <ListingFormWizard mode="edit" listingId={id} defaultValues={defaultValues} />
    </main>
  );
}
