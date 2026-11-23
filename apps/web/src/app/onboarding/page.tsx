'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { useApiClient } from '@/lib/api-client';
import { useOnboarding } from '@/components/auth/OnboardingProvider';

type Profile = {
  display_name?: string;
  area?: string;
  avatar_url?: string | null;
};

function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/onboarding')) return '/';
  return value;
}

export default function OnboardingPage() {
  const api = useApiClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshOnboarding } = useOnboarding();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('users/me').json<{ data: Profile }>()
      .then(({ data }) => setProfile(data))
      .catch(() => setError(true));
    // The client is stable for the active Clerk session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = async (updated: Partial<Profile>) => {
    setProfile(current => ({ ...current, ...updated }));
    await refreshOnboarding();
    router.replace(getSafeReturnTo(searchParams.get('returnTo')) as any);
  };

  return (
    <div className="relative min-h-[calc(100vh-var(--nav-expanded-h,96px))] w-full flex flex-col items-center justify-center pt-20 sm:pt-24 md:pt-8 pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <section className="w-full max-w-xl rounded-3xl border border-border/30 bg-surface/90 backdrop-blur-2xl p-6 shadow-2xl relative z-10 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-inner">
            <Sparkles size={22} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-3">
            Welcome to StuFlux
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight sm:text-3xl">Set up your profile</h1>
          <p className="mt-2 text-sm text-foreground/60 max-w-sm mx-auto">A photo, name, and general Lahore area help build trust in our peer-to-peer community.</p>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-500 text-center font-medium">We could not load your profile. Refresh the page and try again.</p>
        ) : !profile ? (
          <div className="py-12 text-center text-sm text-foreground/50">Loading your profile…</div>
        ) : (
          <EditProfileForm profile={profile} onSaved={complete} onCancel={() => undefined} onboarding />
        )}
      </section>
    </div>
  );
}

