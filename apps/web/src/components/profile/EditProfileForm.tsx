'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { AreaSelector } from '@/components/shared/AreaSelector';
import { Save, Loader2, X } from 'lucide-react';
import { readApiError } from '@/lib/listings/api';

type Profile = {
  id?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string | null;
  area?: string;
  created_at?: string;
};

type Props = {
  profile: Profile | null;
  onSaved: (updated: Partial<Profile>) => void;
  onCancel: () => void;
};

export function EditProfileForm({ profile, onSaved, onCancel }: Props) {
  const api = useApiClient();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [selectedArea, setSelectedArea] = useState(profile?.area ?? '');
  // search and filter logic removed since AreaSelector handles it internally.

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    displayName !== (profile?.display_name ?? '') ||
    selectedArea !== (profile?.area ?? '');

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await api.put('users/me', {
        json: {
          display_name: displayName.trim(),
          ...(selectedArea && { area: selectedArea }),
        },
      }).json<{ data: Profile }>();
      onSaved(response.data);
      router.refresh();
    } catch (error) {
      setError(await readApiError(error, 'Your profile could not be saved. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-display">
            Display Name
          </label>
          <input
            id="edit-display-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--foreground)]/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)]/60 transition-all"
          />
        </div>

        {/* Area Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-display">
            Your Area in Lahore
          </label>

          <AreaSelector
            value={selectedArea}
            onChange={(area) => setSelectedArea(area)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hyper-liquid text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
