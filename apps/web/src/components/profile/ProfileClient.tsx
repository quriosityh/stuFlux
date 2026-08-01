'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignOut } from '@/components/profile/useSignOut';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { useApiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  User, MapPin, Calendar, ShieldCheck,
  Star, DollarSign, Clock, PackageCheck, History,
  Settings, TrendingUp, ShoppingBag, Edit3, LogOut,
  ChevronRight, Sparkles, Sun, Moon, PlusCircle, ArrowRight
} from 'lucide-react';

export type UserStats = {
  total_earned: number;
  pending_earnings: number;
  completed_lent: number;
  completed_borrowed: number;
  lender_rating_avg: number | null;
  lender_rating_count: number;
  renter_rating_avg: number | null;
  renter_rating_count: number;
};

export type Profile = {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string | null;
  area?: string;
  phone_verified?: boolean;
  stats?: UserStats;
  created_at?: string;
};

export type Booking = {
  id: string;
  role?: 'owner' | 'renter' | 'lender';
  status?: string;
  total_amount?: number;
  delivery_fee?: number;
  security_deposit?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  listing?: {
    id: string;
    title: string;
    photo?: { url?: string; thumbnail_url?: string } | null;
  };
  renter?: { display_name: string };
  owner?: { display_name: string };
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  role: 'as_lender' | 'as_renter';
  created_at: string;
  reviewer?: {
    id: string;
    display_name: string;
    avatar_url?: string | null;
  };
  listing?: {
    id: string;
    title: string;
  };
};

type Props = {
  initialProfile: Profile | null;
  initialBookings: Booking[];
  initialReviews?: Review[];
  initialListings?: { data?: any[]; meta?: { total?: number } };
};

function formatPKR(amount: number = 0): string {
  const pkr = amount > 100000 ? Math.round(amount / 100) : amount;
  return `Rs. ${pkr.toLocaleString()}`;
}

type TabKey = 'earnings' | 'history' | 'reviews' | 'settings';

type HistoryRole = 'lender' | 'renter';
type ReviewFilter = 'all' | 'as_lender' | 'as_renter';

export function ProfileClient({ initialProfile, initialBookings, initialReviews = [], initialListings }: Props) {
  const api = useApiClient();
  const router = useRouter();
  const { signOut } = useSignOut();

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [bookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<TabKey>('earnings');
  const [historyRole, setHistoryRole] = useState<HistoryRole>('lender');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (profile?.id && initialReviews.length === 0) {
      api.get(`users/${profile.id}/reviews`)
        .json<{ data: Review[] }>()
        .then((res) => {
          if (res.data) setReviews(res.data);
        })
        .catch(() => {});
    }
  }, [profile?.id, initialReviews.length, api]);

  useEffect(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setCurrentTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stuflux_theme', theme);
  };

  const stats = profile?.stats;
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : 'Jun 2026';

  const areaLabel = useMemo(() => {
    if (!profile?.area) return null;
    return getAreaById(profile.area, LAHORE_AREAS_DATA)?.name ?? profile.area;
  }, [profile?.area]);

  const listingCount = initialListings?.meta?.total ?? 0;

  const handleProfileSaved = useCallback((updated: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditProfileOpen(false);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const isLenderRole = b.role === 'owner' || b.role === 'lender';
      return historyRole === 'lender' ? isLenderRole : !isLenderRole;
    });
  }, [bookings, historyRole]);

  const monthlyEarnings = useMemo(() => {
    const completedLenderBookings = bookings.filter(
      (b) => (b.role === 'owner' || b.role === 'lender') && b.status === 'completed'
    );
    const monthsMap = new Map<string, { total: number; count: number }>();

    completedLenderBookings.forEach((b) => {
      const monthKey = b.end_date || b.created_at
        ? format(new Date(b.end_date || b.created_at!), 'MMMM yyyy')
        : 'Recent';
      const amount = (b.total_amount || 0) + (b.delivery_fee || 0);
      const existing = monthsMap.get(monthKey) || { total: 0, count: 0 };
      monthsMap.set(monthKey, {
        total: existing.total + amount,
        count: existing.count + 1,
      });
    });

    return Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
    }));
  }, [bookings]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter((r) => r.role === reviewFilter);
  }, [reviews, reviewFilter]);

  const tabs = [
    { id: 'earnings' as const, label: 'Earnings', icon: DollarSign },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'reviews' as const, label: 'Reviews', icon: Star },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-5 sm:pt-8 lg:px-6">
        <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_50%)]" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex-shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-[var(--accent)] to-cyan-500 text-3xl font-semibold text-white shadow-lg sm:h-24 sm:w-24">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
                  ) : (
                    <User size={34} />
                  )}
                </div>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[var(--background)] bg-emerald-400 shadow-sm" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {profile?.display_name ?? 'Student'}
                  </h1>
                  {profile?.phone_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--foreground)]/65">
                  {areaLabel && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[var(--accent)]" />
                      {areaLabel}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--accent)]" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="edit-profile-hero-btn"
                onClick={() => setEditProfileOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/80 px-4 py-2.5 text-sm font-semibold transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
              <button
                onClick={() => router.push('/listings/new' as any)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                <PlusCircle size={15} />
                Create Listing
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-emerald-500/10 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Total earned</div>
              <div className="mt-2 font-display text-xl font-semibold">{formatPKR(stats?.total_earned || 0)}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface)]/65 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">Your listings</div>
              <div className="mt-2 font-display text-xl font-semibold">{listingCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface)]/65 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">Reviews</div>
              <div className="mt-2 font-display text-xl font-semibold">{reviews.length}</div>
            </div>
          </div>
        </section>

        {editProfileOpen && (
          <div className="rounded-[2rem] border border-white/10 bg-[var(--surface)]/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <EditProfileForm
              profile={profile}
              onSaved={handleProfileSaved}
              onCancel={() => setEditProfileOpen(false)}
            />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-[var(--surface)]/70 p-3">
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">Workspace</div>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <div key={tab.id} className="relative w-full">
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-l-md bg-[var(--accent)]" aria-hidden />}
                      <button
                        id={`tab-${tab.id}-btn`}
                        onClick={() => setActiveTab(tab.id)}
                        aria-pressed={isActive}
                        aria-label={`${tab.label} tab`}
                        className={`flex min-w-[95px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:min-w-0 lg:justify-start w-full ${
                          isActive
                            ? 'bg-[var(--accent)]/6 text-[var(--accent)]'
                            : 'text-[var(--foreground)]/60 hover:bg-[var(--accent)]/6 hover:text-[var(--foreground)]'
                        }`}
                      >
                        <Icon size={15} />
                        <span className="hidden lg:inline">{tab.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 rounded-lg bg-[var(--accent)]/6 p-3">
                <div className="text-sm font-semibold">Need momentum?</div>
                <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/60">
                  Add a new listing to unlock more earnings and make your profile feel active.
                </p>
                <button
                  onClick={() => router.push('/listings/new' as any)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
                >
                  <PlusCircle size={14} />
                  Publish item
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            {activeTab === 'earnings' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">Total earned</span>
                      <DollarSign size={18} className="text-emerald-400" />
                    </div>
                    <div className="mt-3 font-display text-2xl font-semibold">{formatPKR(stats?.total_earned || 0)}</div>
                    <div className="mt-1 text-sm text-[var(--foreground)]/55">Completed lend-outs, excluding deposits</div>
                  </div>
                  <div className="rounded-[1.6rem] border border-amber-500/20 bg-amber-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">Pending / active</span>
                      <Clock size={18} className="text-amber-400" />
                    </div>
                    <div className="mt-3 font-display text-2xl font-semibold">{formatPKR(stats?.pending_earnings || 0)}</div>
                    <div className="mt-1 text-sm text-[var(--foreground)]/55">Confirmed and ongoing rentals</div>
                  </div>
                  <div className="rounded-[1.6rem] border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Completed lent</span>
                      <PackageCheck size={18} className="text-[var(--accent)]" />
                    </div>
                    <div className="mt-3 font-display text-2xl font-semibold">{stats?.completed_lent || 0} rentals</div>
                    <div className="mt-1 text-sm text-[var(--foreground)]/55">Successful lend transactions</div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-[var(--surface)]/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]/60">
                      <Sparkles size={15} className="text-[var(--accent)]" />
                      Monthly flow
                    </h3>
                    <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-[var(--accent)]">View history</button>
                  </div>

                  {monthlyEarnings.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-[var(--border-color)]/70 bg-[var(--background)]/70 p-8 text-center">
                      <p className="text-sm font-semibold">You have not earned from a completed rental yet.</p>
                      <p className="mt-2 text-sm text-[var(--foreground)]/50">List an item to start turning your inventory into income.</p>
                      <button onClick={() => router.push('/listings/new' as any)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                        <PlusCircle size={15} />
                        Create listing
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-color)]/70">
                      {monthlyEarnings.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3">
                          <div>
                            <div className="text-sm font-semibold">{item.month}</div>
                            <div className="text-xs text-[var(--foreground)]/45">{item.count} completed rental{item.count > 1 ? 's' : ''}</div>
                          </div>
                          <div className="font-display text-sm font-semibold text-emerald-400">{formatPKR(item.total)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHistoryRole('lender')}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                      historyRole === 'lender'
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                        : 'bg-[var(--surface)]/70 text-[var(--foreground)]/60'
                    }`}
                  >
                    Lent out ({stats?.completed_lent || 0})
                  </button>
                  <button
                    onClick={() => setHistoryRole('renter')}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                      historyRole === 'renter'
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-[var(--surface)]/70 text-[var(--foreground)]/60'
                    }`}
                  >
                    Borrowed ({stats?.completed_borrowed || 0})
                  </button>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="rounded-[1.8rem] border border-dashed border-[var(--border-color)]/70 bg-[var(--surface)]/70 p-10 text-center">
                    <History size={36} className="mx-auto mb-3 text-[var(--foreground)]/25" />
                    <p className="text-sm font-semibold">No {historyRole === 'lender' ? 'lend-out' : 'borrowed'} history yet.</p>
                    <p className="mt-2 text-sm text-[var(--foreground)]/50">Complete your first booking and it will show up here with richer details.</p>
                    <button onClick={() => router.push('/listings/new' as any)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                      <PlusCircle size={15} />
                      Start listing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-[var(--surface)]/80 p-4">
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--border-color)]/70 text-[var(--foreground)]/35">
                            {b.listing?.photo?.url ? (
                              <img src={b.listing.photo.url} alt={b.listing?.title || 'Listing photo'} className="h-full w-full object-cover" />
                            ) : (
                              <PackageCheck size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{b.listing?.title || 'Rental booking'}</div>
                            <div className="mt-1 truncate text-sm text-[var(--foreground)]/50">
                              {historyRole === 'lender' ? `Renter: ${b.renter?.display_name || 'Student'}` : `Host: ${b.owner?.display_name || 'Owner'}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-sm font-semibold">{formatPKR((b.total_amount || 0) + (b.delivery_fee || 0))}</div>
                          <div className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                            {b.status || 'Completed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-[var(--surface)]/80 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]/45">Reviews summary</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={18} className="fill-amber-400" />
                        <span className="font-display text-xl font-semibold text-[var(--foreground)]">
                          {reviewFilter === 'as_lender'
                            ? (stats?.lender_rating_avg || 'N/A')
                            : reviewFilter === 'as_renter'
                            ? (stats?.renter_rating_avg || 'N/A')
                            : ((stats?.lender_rating_avg || stats?.renter_rating_avg) || 'N/A')}
                        </span>
                      </div>
                      <span className="text-sm text-[var(--foreground)]/45">({filteredReviews.length} published reviews)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-color)]/70 bg-[var(--background)]/70 p-1.5">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'as_lender', label: 'As lender' },
                      { key: 'as_renter', label: 'As renter' },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setReviewFilter(filter.key as ReviewFilter)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
                          reviewFilter === filter.key
                            ? 'bg-[var(--accent)] text-white'
                            : 'text-[var(--foreground)]/55'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="rounded-[1.8rem] border border-dashed border-[var(--border-color)]/70 bg-[var(--surface)]/70 p-10 text-center">
                    <Star size={36} className="mx-auto mb-3 text-[var(--foreground)]/25" />
                    <p className="text-sm font-semibold">No reviews in this category yet.</p>
                    <p className="mt-2 text-sm text-[var(--foreground)]/50">Once a rental is completed, the review will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReviews.map((r) => (
                      <div key={r.id} className="rounded-[1.4rem] border border-white/10 bg-[var(--surface)]/80 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-cyan-500 text-sm font-semibold text-white">
                              {r.reviewer?.display_name?.[0] || 'S'}
                            </div>
                            <div>
                              <div className="font-semibold">{r.reviewer?.display_name || 'Anonymous student'}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--foreground)]/45">
                                <span className={`rounded-full px-2 py-1 font-semibold uppercase tracking-[0.2em] ${r.role === 'as_lender' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                  {r.role === 'as_lender' ? 'Lender' : 'Renter'}
                                </span>
                                <span>{r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : 'Recent'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={13} className={s <= r.rating ? 'fill-amber-400' : 'text-[var(--border-color)]'} />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="mt-4 text-sm leading-6 text-[var(--foreground)]/75">“{r.comment}”</p>}
                        {r.listing && <div className="mt-4 border-t border-[var(--border-color)]/60 pt-3 text-sm font-semibold text-[var(--accent)]">Re: {r.listing.title}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[var(--surface)]/80">
                  <button id="settings-edit-profile-row" onClick={() => setEditProfileOpen(true)} className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--accent)]/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Edit3 size={16} />
                      </div>
                      <div>
                        <div className="font-semibold">Edit profile</div>
                        <div className="mt-1 text-sm text-[var(--foreground)]/50">Update your display name and Lahore area</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[var(--foreground)]/35" />
                  </button>

                  <div className="flex items-center justify-between border-t border-[var(--border-color)]/60 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="font-semibold">Phone verification</div>
                        <div className="mt-1 text-sm text-[var(--foreground)]/50">{profile?.phone_verified ? 'Your number is verified for trust' : 'Verify your number to build confidence'}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile?.phone_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {profile?.phone_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border-color)]/60 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                        {currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold">Theme appearance</div>
                        <div className="mt-1 text-sm text-[var(--foreground)]/50">Switch between dark and light modes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border border-[var(--border-color)]/70 bg-[var(--background)]/70 p-1">
                      <button onClick={() => toggleTheme('light')} className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${currentTheme === 'light' ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground)]/50'}`}>Light</button>
                      <button onClick={() => toggleTheme('dark')} className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${currentTheme === 'dark' ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground)]/50'}`}>Dark</button>
                    </div>
                  </div>

                  <button id="settings-logout-btn" onClick={() => signOut()} className="flex w-full items-center justify-between border-t border-[var(--border-color)]/60 p-5 text-left transition-colors hover:bg-red-500/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                        <LogOut size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-red-400">Sign out</div>
                        <div className="mt-1 text-sm text-[var(--foreground)]/50">Securely exit this browser session</div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-red-400/50" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
