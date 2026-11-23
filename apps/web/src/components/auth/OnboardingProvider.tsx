'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApiClient } from '@/lib/api-client';

type OnboardingContextValue = {
  onboarded: boolean | null;
  refreshOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type MeResponse = { data: { onboarded: boolean } };

function safeReturnTo(pathname: string, search: string) {
  if (pathname === '/onboarding' || pathname.startsWith('/auth/')) return '/';
  return `${pathname}${search}`;
}

function completedOnboardingDestination(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/onboarding')) return '/';
  return value;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  const refreshOnboarding = async () => {
    if (!isSignedIn) {
      setOnboarded(null);
      return;
    }
    const response = await api.get('users/me').json<MeResponse>();
    setOnboarded(response.data.onboarded);
  };

  useEffect(() => {
    if (!isLoaded) return;
    refreshOnboarding().catch(() => setOnboarded(null));
    // `api` changes with Clerk's token getter; only refetch when auth state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || onboarded === null) return;

    if (!onboarded && pathname !== '/onboarding') {
      const returnTo = safeReturnTo(pathname, searchParams.size ? `?${searchParams}` : '');
      router.replace(`/onboarding?returnTo=${encodeURIComponent(returnTo)}` as any);
    } else if (onboarded && pathname === '/onboarding') {
      router.replace(completedOnboardingDestination(searchParams.get('returnTo')) as any);
    }
  }, [isSignedIn, onboarded, pathname, router, searchParams]);

  const value = useMemo(() => ({ onboarded, refreshOnboarding }), [onboarded]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
