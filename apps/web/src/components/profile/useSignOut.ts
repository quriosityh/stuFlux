'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const { signOut } = useClerk();
  const router = useRouter();

  return {
    signOut: () =>
      signOut(() => router.push('/')),
  };
}
