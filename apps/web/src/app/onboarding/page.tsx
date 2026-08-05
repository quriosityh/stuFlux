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
    <div className="flex flex-1 items-center justify-center bg-[var(--background)] px-4 py-10 sm:px-6">
      <section className="w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/5 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Sparkles size={22} />
          </div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Welcome to StuFlux</p>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Set up your profile</h1>
          <p className="mt-2 text-sm text-[var(--foreground)]/55">A photo, name, and general Lahore area help the community feel more trusted.</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-500">We could not load your profile. Refresh the page and try again.</p>
        ) : !profile ? (
          <div className="py-12 text-center text-sm text-[var(--foreground)]/45">Loading your profile…</div>
        ) : (
          <EditProfileForm profile={profile} onSaved={complete} onCancel={() => undefined} onboarding />
        )}
      </section>
    </div>
  );
}
