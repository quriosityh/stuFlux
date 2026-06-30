'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSignOut } from '@/components/profile/useSignOut';
import { ListingOwnerCard } from '@/components/profile/ListingOwnerCard';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { useApiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  User, MapPin, Calendar,
  Package, Star,
  TrendingUp, ShoppingBag, Edit3, LogOut,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
type Profile = {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string | null;
  area?: string;
  created_at?: string;
};

type Listing = {
  id: string;
  title: string;
  daily_rate: number;
  area: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  view_count: number;
  created_at: string;
  category?: { name: string; icon?: string };
  photo?: { url?: string; thumbnail_url?: string } | null;
};

type Booking = {
  id: string;
  role?: string;
  status?: string;
};

type Props = {
  initialProfile: Profile | null;
  initialListings: Listing[];
  initialBookings: Booking[];
};

// ─── Stat Badge ─────────────────────────────────────────────────────────────
function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] min-w-[80px]">
      <span className="text-[var(--accent)]">{icon}</span>
      <span className="text-xl font-bold font-display text-[var(--foreground)]">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/40">{label}</span>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="h-px flex-1 bg-[var(--border-color)]" />
      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--foreground)]/40 font-display">{label}</span>
      <div className="h-px flex-1 bg-[var(--border-color)]" />
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
function TabBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30'
          : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:border-[var(--accent)]/40'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ProfileClient({ initialProfile, initialListings, initialBookings }: Props) {
  const api = useApiClient();
  const { signOut } = useSignOut();

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // ── Stats derived from data
  const completedAsOwner = initialBookings.filter(
    (b) => b.status === 'completed' && b.role !== 'renter'
  ).length;
  const completedAsRenter = initialBookings.filter(
    (b) => b.status === 'completed' && b.role === 'renter'
  ).length;
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const inactiveCount = listings.filter((l) => l.status === 'inactive' || l.status === 'draft').length;

  // ── Listing quick actions
  const handleStatusChange = useCallback(async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await api.put(`listings/${id}`, { json: { status: newStatus } }).json();
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    } catch (e) {
      console.error('Failed to update listing status', e);
    }
  }, [api]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.put(`listings/${id}`, { json: { status: 'archived' } }).json();
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error('Failed to archive listing', e);
    }
  }, [api]);

  const handleProfileSaved = useCallback((updated: Partial<Profile>) => {
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    setEditProfileOpen(false);
  }, []);

  const filteredListings = listings.filter((l) =>
    activeTab === 'active' ? l.status === 'active' : (l.status === 'inactive' || l.status === 'draft')
  );

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM yyyy')
    : null;

  const areaLabel = useMemo(() => {
    if (!profile?.area) return null;
    return getAreaById(profile.area, LAHORE_AREAS_DATA)?.name ?? profile.area;
  }, [profile?.area]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-8 sm:pt-14">

        {/* ── Hero Card ─────────────────────────────────────────── */}
        <div
          className="chrome-card rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              {/* Online dot */}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[var(--surface)]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] truncate">
                {profile?.display_name ?? 'Your Name'}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {areaLabel && (
                  <span className="flex items-center gap-1.5 text-sm text-[var(--foreground)]/55">
                    <MapPin size={13} className="text-[var(--accent)]" />
                    {areaLabel}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1.5 text-sm text-[var(--foreground)]/55">
                    <Calendar size={13} className="text-[var(--accent)]" />
                    Member since {memberSince}
                  </span>
                )}
              </div>

              {/* Mock rating */}
              <div className="flex items-center gap-1.5 mt-2">
                {[1,2,3,4,5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-[var(--border-color)] text-[var(--border-color)]'}
                  />
                ))}
                <span className="text-sm font-semibold text-[var(--foreground)]/70 ml-1">4.8</span>
                <span className="text-xs text-[var(--foreground)]/40">· 12 reviews</span>
              </div>
            </div>

            {/* Edit button */}
            <button
              id="edit-profile-btn"
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all duration-200 flex-shrink-0"
            >
              <Edit3 size={14} />
              Edit
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <StatBadge icon={<Package size={16} />} label="Listings" value={listings.length} />
            <StatBadge icon={<TrendingUp size={16} />} label="Lent" value={completedAsOwner} />
            <StatBadge icon={<ShoppingBag size={16} />} label="Rented" value={completedAsRenter} />
          </div>
        </div>

        {/* ── Edit Profile Panel ─────────────────────────────────── */}
        {editProfileOpen && (
          <div className="mt-4 chrome-card rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <EditProfileForm
              profile={profile}
              onSaved={handleProfileSaved}
              onCancel={() => setEditProfileOpen(false)}
            />
          </div>
        )}

        {/* ── My Listings ───────────────────────────────────────── */}
        <SectionHeader label="My Listings" />

        {/* Tab switcher */}
        <div className="flex gap-3 mb-6">
          <TabBtn active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
            Active ({activeCount})
          </TabBtn>
          <TabBtn active={activeTab === 'inactive'} onClick={() => setActiveTab('inactive')}>
            Inactive ({inactiveCount})
          </TabBtn>
        </div>

        {/* Listings grid */}
        {filteredListings.length === 0 ? (
          <div className="chrome-card rounded-3xl p-10 text-center">
            <Package size={40} className="mx-auto text-[var(--foreground)]/20 mb-4" />
            <p className="font-display font-bold text-[var(--foreground)]/40">
              {activeTab === 'active' ? 'No active listings' : 'No inactive listings'}
            </p>
            <p className="text-sm text-[var(--foreground)]/30 mt-1">
              {activeTab === 'active'
                ? 'Create a listing to start earning.'
                : 'Paused listings will appear here.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredListings.map((listing) => (
              <ListingOwnerCard
                key={listing.id}
                listing={listing}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* ── Settings ──────────────────────────────────────────── */}
        <SectionHeader label="Settings" />

        <div className="chrome-card rounded-3xl overflow-hidden">
          {/* Edit Profile row */}
          <button
            id="settings-edit-profile-btn"
            onClick={() => { setEditProfileOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--accent)]/5 transition-colors border-b border-[var(--border-color)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <Edit3 size={15} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">Edit Profile</p>
                <p className="text-xs text-[var(--foreground)]/40">Update name and area</p>
              </div>
            </div>
          </button>

          {/* Log Out row */}
          <button
            id="logout-btn"
            onClick={() => signOut()}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-red-500/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <LogOut size={15} className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-red-400">Log Out</p>
                <p className="text-xs text-[var(--foreground)]/40">Sign out of this device</p>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
