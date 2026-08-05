import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { OwnerListingsClient } from '@/components/listings/OwnerListingsClient';

export const metadata: Metadata = {
  title: 'My Listings · StuFlux',
  description: 'Manage your inventory, availability, and pricing.',
};

export default async function ListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in');

  return <OwnerListingsClient />;
}
