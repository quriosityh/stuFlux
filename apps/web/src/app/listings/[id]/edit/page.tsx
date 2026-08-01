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
      // Map existing photo rows → PhotoObject[] so the wizard can show and re-submit them
      photos: (l.photos ?? []).map((p: any) => ({
        url: p.url,
        secure_url: p.url,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        size_kb: p.size_kb ?? undefined,
        mime_type: p.mime_type ?? undefined,
      })).filter((p: any) => Boolean(p.url)),
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
