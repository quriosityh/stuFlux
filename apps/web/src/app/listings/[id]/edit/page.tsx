import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import { ListingFormWizard } from '@/components/listing-form/ListingFormWizard';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/auth/sign-in' as any);

  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let defaultValues = {};
  try {
    const res = await api.get(`listings/${params.id}`).json<{ data: any }>();
    const l = res.data;
    if (!l) redirect('/' as any);

    defaultValues = {
      title: l.title ?? '',
      description: l.description ?? '',
      category_id: l.category?.id ?? 0,
      daily_rate: l.daily_rate ?? 0,
      area: l.area ?? '',
      condition: l.condition ?? '',
      rental_rules: l.rental_rules ?? '',
      specs: l.specs ?? {},
      min_rental_days: l.min_rental_days ?? 1,
      max_rental_days: l.max_rental_days ?? 30,
      delivery_available: l.delivery_available ?? false,
      delivery_fee: l.delivery_fee ?? 0,
      security_deposit: l.security_deposit ?? 0,
      status: l.status ?? 'draft',
      // Map photos array → photo_urls string array for the wizard
      photo_urls: (l.photos ?? []).map((p: any) => p.url).filter(Boolean),
      blocked_dates: [],
    };
  } catch {
    redirect('/profile' as any);
  }

  return (
    <main>
      <ListingFormWizard mode="edit" listingId={params.id} defaultValues={defaultValues} />
    </main>
  );
}
