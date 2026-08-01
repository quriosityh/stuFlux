'use client';

import { useState, useMemo } from 'react';
import { useApiClient } from '@/lib/api-client';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, type LahoreArea } from '@stuflux/types';
import { Search, MapPin, Check, Save, Loader2, X } from 'lucide-react';

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
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [selectedArea, setSelectedArea] = useState(profile?.area ?? '');
  const [areaSearch, setAreaSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAreas = useMemo<LahoreArea[]>(() => {
    if (!areaSearch.trim()) {
      return POPULAR_AREA_IDS
        .map(id => getAreaById(id, LAHORE_AREAS_DATA))
        .filter(Boolean) as LahoreArea[];
    }
    return searchAreas(areaSearch, LAHORE_AREAS_DATA, 8);
  }, [areaSearch]);

  const selectedAreaLabel = useMemo(() => {
    if (!selectedArea) return null;
    return getAreaById(selectedArea, LAHORE_AREAS_DATA)?.name ?? selectedArea;
  }, [selectedArea]);

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
      await api.put('users/me', {
        json: {
          display_name: displayName.trim(),
          ...(selectedArea && { area: selectedArea }),
        },
      }).json();
      onSaved({ display_name: displayName.trim(), area: selectedArea });
    } catch (e: any) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Edit profile</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/50">Fine-tune how your profile appears to other students.</p>
        </div>
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--foreground)]/40 transition-all hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]/40">
            Display name
          </label>
          <input
            id="edit-display-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/25 transition-all focus:border-[var(--accent)]/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]/40">
            Your area in Lahore
          </label>

          {selectedAreaLabel && (
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                <MapPin size={12} />
                {selectedAreaLabel}
              </span>
              <button onClick={() => setSelectedArea('')} className="text-xs text-[var(--foreground)]/40 transition-colors hover:text-[var(--foreground)]">
                Clear
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/30" />
            <input
              id="edit-area-search"
              type="text"
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              placeholder="Search area…"
              className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--background)] pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/25 transition-all focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </div>

          <div className="flex max-h-52 flex-col overflow-y-auto rounded-2xl border border-[var(--border-color)]/50 divide-y divide-[var(--border-color)]/30 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-color)]">
            {filteredAreas.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--foreground)]/30">
                No areas found for &ldquo;{areaSearch}&rdquo;
              </div>
            ) : (
              filteredAreas.map((area: LahoreArea) => {
                const isSelected = selectedArea === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => { setSelectedArea(area.id); setAreaSearch(''); }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[var(--accent)]/8 text-[var(--foreground)]'
                        : 'text-[var(--foreground)]/70 hover:bg-[var(--surface)]/60'
                    }`}
                  >
                    <MapPin className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/25'}`} />
                    <span className="flex-1 text-sm font-medium">{area.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent)]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 rounded-2xl border border-[var(--border-color)] py-2.5 text-sm font-semibold text-[var(--foreground)]/60 transition-colors hover:text-[var(--foreground)]">
            Cancel
          </button>
          <button
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
