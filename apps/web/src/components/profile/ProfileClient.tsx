'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSignOut } from '@/components/profile/useSignOut';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { useApiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  User, MapPin, Calendar, CheckCircle2, ShieldCheck,
  Star, DollarSign, Clock, PackageCheck, History,
  Settings, TrendingUp, ShoppingBag, Edit3, LogOut,
  ChevronRight, Sparkles, Filter, MessageSquare, Sun, Moon, Phone
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
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
};

// Format currency helper (convert paisa or PKR integer to formatted Rs. string)
function formatPKR(amount: number = 0): string {
  // If amount > 100000, assume it's in paisa and divide by 100, otherwise use as PKR
  const pkr = amount > 100000 ? Math.round(amount / 100) : amount;
  return `Rs. ${pkr.toLocaleString()}`;
}

function formatBookingDates(startDate?: string, endDate?: string): string | null {
  if (!startDate && !endDate) return null;

  const start = startDate ? format(new Date(startDate), 'dd MMM yyyy') : null;
  const end = endDate ? format(new Date(endDate), 'dd MMM yyyy') : null;
  return start && end ? `${start} – ${end}` : start ?? end;
}

export function ProfileClient({ initialProfile, initialBookings, initialReviews = [] }: Props) {
  const api = useApiClient();
  const { signOut } = useSignOut();

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [bookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Tab Navigation State: 'earnings' | 'history' | 'reviews' | 'settings'
  const [activeTab, setActiveTab] = useState<'earnings' | 'history' | 'reviews' | 'settings'>('earnings');
  
  // History Sub-toggle: 'lender' | 'renter'
  const [historyRole, setHistoryRole] = useState<'lender' | 'renter'>('lender');
  
  // Reviews Role Filter: 'as_lender' | 'as_renter'
  const [reviewFilter, setReviewFilter] = useState<'as_lender' | 'as_renter'>('as_lender');
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  // Fallback: fetch reviews client-side only if SSR missed them (race/error)
  // Use useRef for the api client so it's stable across renders (avoids infinite loop)
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; });

  useEffect(() => {
    if (!profile?.id || initialReviews.length > 0) return;
    apiRef.current
      .get(`reviews?targetId=${profile.id}&limit=50`)
      .json<{ data: { reviews: Review[] } | Review[] }>()
      .then((res: any) => {
        const arr = res?.data?.reviews ?? res?.data ?? [];
        if (Array.isArray(arr)) setReviews(arr);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Theme detector
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

  const handleProfileSaved = useCallback((updated: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditProfileOpen(false);
  }, []);

  // Filter history bookings based on historyRole toggle
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const isLenderRole = b.role === 'owner' || b.role === 'lender';
        const matchesRole = historyRole === 'lender' ? isLenderRole : !isLenderRole;
        return matchesRole && (b.status === 'confirmed' || b.status === 'completed');
      })
      .sort((a, b) => {
        const aDate = new Date(a.end_date || a.start_date || a.created_at || 0).getTime();
        const bDate = new Date(b.end_date || b.start_date || b.created_at || 0).getTime();
        return bDate - aDate;
      });
  }, [bookings, historyRole]);

  // Monthly earnings summary calculation from completed lender bookings
  const monthlyEarnings = useMemo(() => {
    const completedLenderBookings = bookings.filter(
      (b) => (b.role === 'owner' || b.role === 'lender') && b.status === 'completed'
    );
    const monthsMap = new Map<string, { total: number; count: number; sortDate: Date }>();

    completedLenderBookings.forEach((b) => {
      const earningDate = b.end_date || b.created_at;
      const monthKey = earningDate
        ? format(new Date(earningDate), 'MMMM yyyy')
        : 'Recent';
      const amount = (b.total_amount || 0) + (b.delivery_fee || 0);
      const existing = monthsMap.get(monthKey) || {
        total: 0,
        count: 0,
        sortDate: earningDate ? new Date(earningDate) : new Date(0),
      };
      monthsMap.set(monthKey, {
        total: existing.total + amount,
        count: existing.count + 1,
        sortDate: existing.sortDate,
      });
    });

    return Array.from(monthsMap.entries())
      .sort(([, a], [, b]) => b.sortDate.getTime() - a.sortDate.getTime())
      .map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
      }));
  }, [bookings]);

  // Filtered reviews based on reviewFilter
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => r.role === reviewFilter);
  }, [reviews, reviewFilter]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. HERO HEADER WITH IDENTITY & DUAL-ROLE REPUTATION CHIPS          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div
          className="chrome-card rounded-3xl p-6 sm:p-8 animate-in fade-in duration-500 mb-6"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={36} />
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[var(--surface)] shadow-sm" />
              </div>

              {/* User Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight truncate">
                    {profile?.display_name ?? 'Student'}
                  </h1>
                  {profile?.phone_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--foreground)]/60 font-medium">
                  {areaLabel && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[var(--accent)]" />
                      {areaLabel}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-[var(--accent)]" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile CTA */}
            <button
              id="edit-profile-hero-btn"
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-xs font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex-shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>

          {/* DUAL-ROLE REPUTATION CHIPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-[var(--border-color)]/50">
            {/* Lending Chip */}
            <button
              onClick={() => { setActiveTab('reviews'); setReviewFilter('as_lender'); }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--background)]/40 border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                    Lending Reputation
                  </div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold mt-0.5">
                    {stats?.lender_rating_avg ? (
                      <>
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{stats.lender_rating_avg}</span>
                        <span className="text-xs font-normal text-[var(--foreground)]/50">
                          ({stats.lender_rating_count || stats.completed_lent} rentals)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-[var(--accent)]">
                        New to lending ({stats?.completed_lent || 0} lent out)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--foreground)]/30 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Renting Chip */}
            <button
              onClick={() => { setActiveTab('reviews'); setReviewFilter('as_renter'); }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--background)]/40 border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                    Renting Reputation
                  </div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold mt-0.5">
                    {stats?.renter_rating_avg ? (
                      <>
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{stats.renter_rating_avg}</span>
                        <span className="text-xs font-normal text-[var(--foreground)]/50">
                          ({stats.renter_rating_count || stats.completed_borrowed} rentals)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-purple-400">
                        New to renting ({stats?.completed_borrowed || 0} borrowed)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--foreground)]/30 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Edit Profile Form Inline Panel */}
        {editProfileOpen && (
          <div className="mb-6 chrome-card rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <EditProfileForm
              profile={profile}
              onSaved={handleProfileSaved}
              onCancel={() => setEditProfileOpen(false)}
            />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. SEGMENTED CONTROL TABS (Earnings, History, Reviews, Settings)    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="flex p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] mb-6 scrollbar-hide overflow-x-auto">
          <button
            id="tab-earnings-btn"
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'earnings'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <DollarSign size={14} />
            Earnings
          </button>

          <button
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <History size={14} />
            History
          </button>

          <button
            id="tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <Star size={14} />
            Reviews
          </button>

          <button
            id="tab-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <Settings size={14} />
            Settings
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: EARNINGS DASHBOARD                                          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'earnings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top KPI Cards (3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Earned */}
              <div className="chrome-card p-5 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-display">
                    Total Earned
                  </span>
                  <DollarSign size={18} className="text-emerald-400" />
                </div>
                <div className="font-display text-2xl font-bold mt-2 text-[var(--foreground)]">
                  {formatPKR(stats?.total_earned || 0)}
                </div>
                <div className="text-[11px] text-[var(--foreground)]/40 mt-1">
                  Completed lend-outs (excl. deposit)
                </div>
              </div>

              {/* Card 2: Pending / Active */}
              <div className="chrome-card p-5 rounded-2xl border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display">
                    Pending / Active
                  </span>
                  <Clock size={18} className="text-amber-400" />
                </div>
                <div className="font-display text-2xl font-bold mt-2 text-[var(--foreground)]">
                  {formatPKR(stats?.pending_earnings || 0)}
                </div>
                <div className="text-[11px] text-[var(--foreground)]/40 mt-1">
                  Confirmed & ongoing rentals
                </div>
              </div>

              {/* Card 3: Completed Lent */}
              <div className="chrome-card p-5 rounded-2xl border-[var(--accent)]/20 bg-[var(--accent)]/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] font-display">
                    Completed Lent
                  </span>
                  <PackageCheck size={18} className="text-[var(--accent)]" />
                </div>
                <div className="font-display text-2xl font-bold mt-2 text-[var(--foreground)]">
                  {stats?.completed_lent || 0} rentals
                </div>
                <div className="text-[11px] text-[var(--foreground)]/40 mt-1">
                  Successful lend transactions
                </div>
              </div>
            </div>

            {/* Monthly Earnings Summary */}
            <div className="chrome-card rounded-3xl p-6">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-4 flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--accent)]" />
                Monthly Earnings Summary
              </h3>

              {monthlyEarnings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--foreground)]/40">
                  No completed earnings recorded yet. List an item to start earning!
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {monthlyEarnings.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.month}</span>
                      <div className="text-right">
                        <div className="font-display text-sm font-bold text-emerald-400">
                          {formatPKR(item.total)}
                        </div>
                        <div className="text-[10px] text-[var(--foreground)]/40">
                          {item.count} rental{item.count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct link to History Tab */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-right">
                <button
                  id="view-full-history-cta"
                  onClick={() => setActiveTab('history')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  View Full Rental History →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: RENTAL HISTORY                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* History Sub-toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryRole('lender')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  historyRole === 'lender'
                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)] text-[var(--accent)]'
                    : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)]/50'
                }`}
              >
                Lent Out ({stats?.completed_lent || 0})
              </button>
              <button
                onClick={() => setHistoryRole('renter')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  historyRole === 'renter'
                    ? 'bg-purple-500/15 border border-purple-500 text-purple-400'
                    : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)]/50'
                }`}
              >
                Borrowed ({stats?.completed_borrowed || 0})
              </button>
            </div>

            {/* Rental History Cards List */}
            {filteredBookings.length === 0 ? (
              <div className="chrome-card rounded-3xl p-12 text-center">
                <History size={36} className="mx-auto text-[var(--foreground)]/20 mb-3" />
                <p className="font-display text-sm font-bold text-[var(--foreground)]/50">
                  No {historyRole === 'lender' ? 'lend-out' : 'borrowed'} history found
                </p>
                <p className="text-xs text-[var(--foreground)]/30 mt-1">
                  Completed bookings in this role will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((b) => {
                  const dateRange = formatBookingDates(b.start_date, b.end_date);

                  return (
                    <div
                      key={b.id}
                      className="chrome-card p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[var(--border-color)] overflow-hidden flex-shrink-0 flex items-center justify-center text-[var(--foreground)]/30">
                          {b.listing?.photo?.url ? (
                            <img src={b.listing.photo.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <PackageCheck size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display text-sm font-bold truncate">
                            {b.listing?.title || 'Rental Booking'}
                          </h4>
                          <div className="text-xs text-[var(--foreground)]/50 truncate mt-0.5">
                            {historyRole === 'lender'
                              ? `Renter: ${b.renter?.display_name || 'Student'}`
                              : `Host: ${b.owner?.display_name || 'Owner'}`}
                          </div>
                          {dateRange && (
                            <div className="text-[11px] text-[var(--foreground)]/40 mt-0.5">
                              {dateRange}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-sm font-bold text-[var(--foreground)]">
                          {formatPKR((b.total_amount || 0) + (b.delivery_fee || 0))}
                        </div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 mt-1">
                          {b.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 3: REVIEWS FEED                                                */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Aggregate Score Bar & Role Filter */}
            <div className="chrome-card p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/50">
                  Reviews Summary
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={18} className="fill-amber-400" />
                    <span className="font-display text-xl font-bold text-[var(--foreground)]">
                      {reviewFilter === 'as_lender'
                        ? (stats?.lender_rating_avg || 'N/A')
                        : (stats?.renter_rating_avg || 'N/A')}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--foreground)]/40">
                    ({filteredReviews.length} published reviews)
                  </span>
                </div>
              </div>

              {/* Role Filters */}
              <div className="flex items-center gap-1.5 bg-[var(--background)] p-1 rounded-xl border border-[var(--border-color)]">
                <button
                  onClick={() => setReviewFilter('as_lender')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'as_lender'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--foreground)]/50'
                  }`}
                >
                  As Lender
                </button>
                <button
                  onClick={() => setReviewFilter('as_renter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'as_renter'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--foreground)]/50'
                  }`}
                >
                  As Renter
                </button>
              </div>
            </div>

            {/* Reviews Cards List */}
            {filteredReviews.length === 0 ? (
              <div className="chrome-card rounded-3xl p-12 text-center">
                <Star size={36} className="mx-auto text-[var(--foreground)]/20 mb-3" />
                <p className="font-display text-sm font-bold text-[var(--foreground)]/50">
                  No reviews in this category yet
                </p>
                <p className="text-xs text-[var(--foreground)]/30 mt-1">
                  Reviews are automatically published after completed rentals.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="chrome-card p-5 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {r.reviewer?.avatar_url ? (
                            <img
                              src={r.reviewer.avatar_url}
                              alt={r.reviewer.display_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            r.reviewer?.display_name?.[0] || 'S'
                          )}
                        </div>
                        <div>
                          <div className="font-display text-sm font-bold">
                            {r.reviewer?.display_name || 'Anonymous Student'}
                          </div>
                          <div className="text-[10px] text-[var(--foreground)]/40 mt-0.5">
                            Reviewed {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : 'recently'}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= r.rating ? 'fill-amber-400' : 'text-[var(--border-color)]'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    {r.comment && (
                      <p className="text-xs text-[var(--foreground)]/80 leading-relaxed pl-13">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}

                    {/* Listing reference link */}
                    {reviewFilter === 'as_lender' && r.listing && (
                      <a
                        href={`/listings/${r.listing.id}`}
                        className="block text-[11px] text-[var(--accent)] font-semibold pt-1 border-t border-[var(--border-color)]/30 hover:underline"
                      >
                        {r.listing.title}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 4: SETTINGS & ACCOUNT PREFERENCES                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="chrome-card rounded-3xl overflow-hidden divide-y divide-[var(--border-color)]">
              {/* Edit Profile Row */}
              <button
                id="settings-edit-profile-row"
                onClick={() => setEditProfileOpen(true)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[var(--accent)]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold">Edit Profile Information</h4>
                    <p className="text-xs text-[var(--foreground)]/40">Update display name and Lahore area location</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--foreground)]/30" />
              </button>

              {/* Verification Status Row */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold">Phone Verification</h4>
                    <p className="text-xs text-[var(--foreground)]/40">
                      {profile?.phone_verified
                        ? 'Your mobile number is verified for platform trust'
                        : 'Verify phone number to increase trust score'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  profile?.phone_verified
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {profile?.phone_verified ? 'Verified' : 'Pending'}
                </span>
              </div>

              {/* Appearance / Theme Selector Row */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    {currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold">Theme Appearance</h4>
                    <p className="text-xs text-[var(--foreground)]/40">Toggle between dark and light modes</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button
                    onClick={() => toggleTheme('light')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentTheme === 'light'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--foreground)]/40'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => toggleTheme('dark')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentTheme === 'dark'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--foreground)]/40'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Log Out Row */}
              <button
                id="settings-logout-btn"
                onClick={() => signOut()}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <LogOut size={16} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-red-400">Sign Out</h4>
                    <p className="text-xs text-[var(--foreground)]/40">Securely exit your account on this browser</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-400/40" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
