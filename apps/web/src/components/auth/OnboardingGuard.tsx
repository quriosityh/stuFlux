'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api-client';

const UNGUARDED_PATHS = ['/onboarding', '/auth/sign-in', '/auth/sign-up'];

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const api = useApiClient();
  const { isLoaded, user } = useUser();
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user || !pathname || UNGUARDED_PATHS.some((path) => pathname.startsWith(path))) return;

    if (user.publicMetadata.onboarding_completed === true) return;
    if (checkedUserId === user.id) return;

    let active = true;
    api.get('users/me')
      .json<{ data: { onboarding_completed: boolean } }>()
      .then(({ data }) => {
        if (active && !data.onboarding_completed) router.replace('/onboarding' as never);
      })
      .catch(() => {
        if (active) router.replace('/onboarding' as never);
      })
      .finally(() => active && setCheckedUserId(user.id));

    return () => { active = false; };
  }, [api, checkedUserId, isLoaded, pathname, router, user]);

  return null;
}
