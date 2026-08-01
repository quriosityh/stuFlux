import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ListingFormWizard } from '@/components/listing-form/ListingFormWizard';

export const metadata = {
  title: 'List an Item · StuFlux',
  description: 'Earn by renting out your stuff to other students.',
};

export default async function NewListingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in' as any);

  return (
    <main>
      <ListingFormWizard mode="create" />
    </main>
  );
}
