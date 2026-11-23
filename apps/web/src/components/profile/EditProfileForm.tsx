'use client';

import { useState, useMemo, useRef } from 'react';
import { useApiClient } from '@/lib/api-client';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, type LahoreArea } from '@stuflux/types';
import { Search, MapPin, Check, Save, Loader2, X, Camera, User } from 'lucide-react';

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
  onboarding?: boolean;
};

export function EditProfileForm({ profile, onSaved, onCancel, onboarding = false }: Props) {
  const api = useApiClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [selectedArea, setSelectedArea] = useState(profile?.area ?? '');
  const [areaSearch, setAreaSearch] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
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
    selectedArea !== (profile?.area ?? '') ||
    avatarUrl !== (profile?.avatar_url ?? null);

  // ─── Avatar upload: get Cloudinary signature → upload directly → store URL ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side first
    if (file.size > 7 * 1024 * 1024) {
      setError('Photo must be under 7 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
      setError('Only JPEG, PNG or WebP photos are allowed.');
      return;
    }

    setAvatarUploading(true);
    setError(null);

    try {
      // 1. Get signed upload parameters from our API
      const sigRes = await api.post('uploads/signature').json<{
        upload: {
          timestamp: number;
          folder: string;
          signature: string;
          api_key: string;
          cloud_name: string;
        };
      }>();

      const { upload } = sigRes;

      // 2. Upload directly to Cloudinary (browser → Cloudinary, no server proxy)
      const form = new FormData();
      form.append('file', file);
      form.append('timestamp', String(upload.timestamp));
      form.append('folder', upload.folder);
      form.append('signature', upload.signature);
      form.append('api_key', upload.api_key);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${upload.cloud_name}/image/upload`,
        { method: 'POST', body: form }
      );

      if (!cloudRes.ok) throw new Error('Cloudinary upload failed');

      const cloudData = await cloudRes.json();
      setAvatarUrl(cloudData.secure_url);
    } catch {
      setError('Photo upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    if (onboarding && !selectedArea) {
      setError('Please select your area in Lahore.');
      return;
    }
    if (onboarding && !avatarUrl) {
      setError('Please add a profile photo to continue.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const profilePayload = {
        display_name: displayName.trim(),
        ...(selectedArea && { area: selectedArea }),
        ...(avatarUrl !== profile?.avatar_url && { avatar_url: avatarUrl }),
      };
      await (onboarding
        ? api.post('users/me/complete-onboarding', { json: { ...profilePayload, avatar_url: avatarUrl! } })
        : api.put('users/me', { json: profilePayload })
      ).json();
      onSaved({
        display_name: displayName.trim(),
        area: selectedArea,
        avatar_url: avatarUrl,
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header (hidden in onboarding mode since onboarding page provides its own title) */}
      {!onboarding && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-foreground">Edit Profile</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* ── Avatar Picker ── */}
        <div className={`flex flex-col gap-3 ${onboarding ? 'items-center text-center mt-2' : ''}`}>
          {!onboarding && (
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-display">
              Profile Photo
            </label>
          )}
          <div className={`flex ${onboarding ? 'flex-col items-center' : 'items-center'} gap-4`}>
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              <div className={`${onboarding ? 'w-24 h-24' : 'w-20 h-20'} rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent)]/80 to-blue-600/80 flex items-center justify-center text-white shadow-md border-2 border-border/20`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={onboarding ? 40 : 32} className="opacity-90" />
                )}
              </div>
              {/* Loading overlay */}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Upload button */}
            <div className={`flex flex-col gap-2 ${onboarding ? 'items-center' : ''}`}>
              <button
                id="avatar-upload-btn"
                type="button"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border/30 text-xs font-bold text-foreground/80 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-surface transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${onboarding ? 'w-full sm:w-auto' : ''}`}
              >
                <Camera size={15} />
                {avatarUploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-[10px] text-foreground/40 font-medium">
                JPEG, PNG, WebP (Max 7MB)
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Remove photo option */}
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors text-left"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* ── Display Name ── */}
        <div className={`flex flex-col gap-2 ${onboarding ? 'mt-4' : ''}`}>
          <label className={`text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 font-display ${onboarding ? 'text-center' : ''}`}>
            Display Name
          </label>
          <input
            id="edit-display-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. John Doe"
            className={`w-full bg-background border border-border/40 text-foreground placeholder-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all ${
              onboarding ? 'text-center text-base py-4 rounded-2xl bg-surface/50 shadow-sm' : ''
            }`}
          />
        </div>

        {/* ── Area Selection ── */}
        <div className="flex flex-col gap-2">
          <label className={`text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 font-display ${onboarding ? 'text-center' : ''}`}>
            Your Area in Lahore
          </label>

          {selectedAreaLabel && (
            <div className={`flex items-center gap-2 mb-1 ${onboarding ? 'justify-center' : ''}`}>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-full border border-[var(--accent)]/20 shadow-sm">
                <MapPin size={14} />
                {selectedAreaLabel}
              </span>
              <button
                onClick={() => setSelectedArea('')}
                className="text-xs font-semibold text-foreground/40 hover:text-foreground transition-colors ml-1"
              >
                Clear
              </button>
            </div>
          )}

          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 ${onboarding ? 'left-4' : 'left-3'}`} />
            <input
              id="edit-area-search"
              type="text"
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              placeholder="Search area…"
              className={`w-full bg-background border border-border/40 text-foreground placeholder-foreground/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all ${
                onboarding ? 'text-center pl-4 pr-10 text-base py-4 rounded-2xl bg-surface/50 shadow-sm' : ''
              }`}
            />
            {onboarding && (
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 opacity-50" />
            )}
          </div>

          <div className={`flex flex-col divide-y divide-border/20 overflow-y-auto max-h-48 rounded-2xl border border-border/30 bg-background/50 backdrop-blur-sm ${onboarding ? 'mt-2' : ''}`}>
            {filteredAreas.length === 0 ? (
              <div className="text-center text-foreground/40 text-sm py-6 font-medium">
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
        <div className={`flex gap-3 ${onboarding ? 'pt-4' : 'pt-1'}`}>
          {!onboarding && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-semibold text-foreground/60 hover:text-foreground hover:bg-surface/50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving || !isDirty || avatarUploading}
            className={`flex-1 flex items-center justify-center gap-2 hyper-liquid font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
              onboarding ? 'py-4 rounded-2xl text-base shadow-lg' : 'py-2.5 rounded-xl text-sm'
            }`}
          >
            {saving ? <Loader2 size={onboarding ? 18 : 15} className="animate-spin" /> : !onboarding && <Save size={15} />}
            {saving ? 'Saving…' : onboarding ? 'Complete Profile' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
