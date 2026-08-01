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

          {/* Selected pill */}
          {selectedAreaLabel && (
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/8 px-3 py-1 rounded-full border border-[var(--accent)]/20">
                <MapPin size={12} />
                {selectedAreaLabel}
              </span>
              <button
                onClick={() => setSelectedArea('')}
                className="text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
            <input
              id="edit-area-search"
              type="text"
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              placeholder="Search area…"
              className="w-full bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--foreground)]/25 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]/60 transition-all"
            />
          </div>

          {/* Area list */}
          <div className="flex flex-col divide-y divide-[var(--border-color)]/30 overflow-y-auto max-h-48 rounded-xl border border-[var(--border-color)]/40 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--border-color)] [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredAreas.length === 0 ? (
              <div className="text-center text-[var(--foreground)]/30 text-sm py-6">
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
                        : 'hover:bg-[var(--surface)]/60 text-[var(--foreground)]/70'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/25'}`} />
                    <span className="text-sm font-medium flex-1">{area.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
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
