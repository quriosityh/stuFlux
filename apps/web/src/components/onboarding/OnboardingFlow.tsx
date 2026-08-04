'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { MapPin, UserRound } from 'lucide-react';
import { AreaSelector } from '@/components/shared/AreaSelector';
import { Button } from '@/components/ui/Button';
import { useApiClient } from '@/lib/api-client';

type OnboardingProfile = {
  display_name: string;
  area: string;
  onboarding_completed: boolean;
};

export function OnboardingFlow() {
  const api = useApiClient();
  const router = useRouter();
  const { user } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [area, setArea] = useState('johar-town');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api.get('users/me')
      .json<{ data: OnboardingProfile }>()
      .then(({ data }) => {
        if (!active) return;
        if (data.onboarding_completed) {
          router.replace('/explore' as never);
          return;
        }
        setDisplayName(data.display_name === 'User' ? '' : data.display_name);
        setArea(data.area || 'johar-town');
      })
      .catch(() => active && setError('We could not load your profile. Please refresh and try again.'))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [api, router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = displayName.trim();

    if (normalizedName.length < 2) {
      setError('Enter a display name with at least 2 characters.');
      return;
    }
    if (!area.trim()) {
      setError('Select your Lahore area to continue.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.put('users/me/onboarding', {
        json: { display_name: normalizedName, area },
      });
      await user?.reload();
      router.replace('/explore' as never);
      router.refresh();
    } catch {
      setError('Your profile could not be saved. Please review your details and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent)]" /></div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <section className="w-full max-w-lg rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]"><UserRound size={22} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Welcome to StuFlux</p>
            <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Complete your profile</h1>
          </div>
        </div>
        <p className="mb-7 text-sm leading-6 text-[var(--foreground)]/65">A name and location help students recognize you and discover nearby rentals.</p>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={100} required autoComplete="name" placeholder="e.g. Ali Khan" className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15" />
          </label>
          <div>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]"><MapPin size={16} className="text-[var(--accent)]" />Your area</span>
            <AreaSelector value={area} onChange={setArea} />
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={saving} className="w-full py-3">
            {saving ? 'Saving your profile…' : 'Finish setup'}
          </Button>
        </form>
      </section>
    </main>
  );
}
