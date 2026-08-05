'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  User, MapPin, Calendar, ShieldCheck, Star,
  TrendingUp, ShoppingBag, PackageCheck, MessageSquare, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export type PublicUserStats = {
  completed_lent: number;
  completed_borrowed: number;
  lender_rating_avg: number | null;
  lender_rating_count: number;
  renter_rating_avg: number | null;
  renter_rating_count: number;
};

export type PublicUserProfile = {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  area?: string;
  phone_verified?: boolean;
  stats?: PublicUserStats;
  created_at?: string;
};

export type PublicListing = {
  id: string;
  title: string;
  price_per_day: number;
  area?: string;
  category_id?: string;
  photo?: { url?: string; thumbnail_url?: string } | null;
};

export type PublicReview = {
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
  profile: PublicUserProfile;
  listings: PublicListing[];
  reviews: PublicReview[];
};

export function PublicProfileClient({ profile, listings, reviews }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'as_lender' | 'as_renter'>('all');

  const stats = profile.stats;

  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : 'Jun 2026';

  const areaLabel = useMemo(() => {
    if (!profile.area) return null;
    return getAreaById(profile.area, LAHORE_AREAS_DATA)?.name ?? profile.area;
  }, [profile.area]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter((r) => r.role === reviewFilter);
  }, [reviews, reviewFilter]);

  const handleSendMessage = () => {
    router.push(`/messages?userId=${profile.id}` as any);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. PUBLIC HERO HEADER                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="chrome-card rounded-3xl p-6 sm:p-8 animate-in fade-in duration-500 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {profile.avatar_url ? (
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
                    {profile.display_name}
                  </h1>
                  {profile.phone_verified && (
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

            {/* Contextual Message CTA */}
            <button
              id="message-user-btn"
              onClick={handleSendMessage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl hyper-liquid text-xs font-bold transition-all flex-shrink-0 self-stretch sm:self-auto justify-center"
            >
              <MessageSquare size={14} />
              Message Student
            </button>
          </div>

          {/* DUAL-ROLE REPUTATION CHIPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-[var(--border-color)]/50">
            {/* Lending Chip */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--background)]/40 border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                    Lender Score
                  </div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold mt-0.5">
                    {stats?.lender_rating_avg ? (
                      <>
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{stats.lender_rating_avg}</span>
                        <span className="text-xs font-normal text-[var(--foreground)]/50">
                          ({stats.lender_rating_count} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-[var(--accent)]">
                        New to lending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Renting Chip */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--background)]/40 border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                    Renter Score
                  </div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold mt-0.5">
                    {stats?.renter_rating_avg ? (
                      <>
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{stats.renter_rating_avg}</span>
                        <span className="text-xs font-normal text-[var(--foreground)]/50">
                          ({stats.renter_rating_count} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-purple-400">
                        New to renting
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. PUBLIC TABS (Listings, Reviews)                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="flex p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] mb-6">
          <button
            id="public-tab-listings-btn"
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'listings'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <PackageCheck size={14} />
            Listings ({listings.length})
          </button>

          <button
            id="public-tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <Star size={14} />
            Reviews ({reviews.length})
          </button>
        </div>

        {/* TAB 1: LISTINGS STOREFRONT */}
        {activeTab === 'listings' && (
          <div className="animate-in fade-in duration-300">
            {listings.length === 0 ? (
              <div className="chrome-card rounded-3xl p-12 text-center">
                <PackageCheck size={36} className="mx-auto text-[var(--foreground)]/20 mb-3" />
                <p className="font-display text-sm font-bold text-[var(--foreground)]/50">
                  User has no active listings right now
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}` as any}
                    className="chrome-card p-4 rounded-2xl flex gap-3.5 hover:border-[var(--accent)]/50 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-[var(--border-color)] overflow-hidden flex-shrink-0">
                      {l.photo?.url ? (
                        <img src={l.photo.url} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/20">
                          <PackageCheck size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display text-sm font-bold truncate group-hover:text-[var(--accent)] transition-colors">
                          {l.title}
                        </h4>
                        {l.area && (
                          <div className="text-[11px] text-[var(--foreground)]/50 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {l.area}
                          </div>
                        )}
                      </div>
                      <div className="font-display text-sm font-bold text-[var(--accent)]">
                        Rs. {(l.price_per_day / 100).toLocaleString()} <span className="text-[10px] font-normal text-[var(--foreground)]/50">/ day</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Filter Pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--foreground)]/50 uppercase tracking-wider">
                Public Reviews ({filteredReviews.length})
              </span>

              <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-xl border border-[var(--border-color)]">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    reviewFilter === 'all' ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground)]/40'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setReviewFilter('as_lender')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    reviewFilter === 'as_lender' ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground)]/40'
                  }`}
                >
                  As Lender
                </button>
                <button
                  onClick={() => setReviewFilter('as_renter')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    reviewFilter === 'as_renter' ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground)]/40'
                  }`}
                >
                  As Renter
                </button>
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="chrome-card rounded-3xl p-12 text-center">
                <Star size={36} className="mx-auto text-[var(--foreground)]/20 mb-3" />
                <p className="font-display text-sm font-bold text-[var(--foreground)]/50">
                  No public reviews found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="chrome-card p-5 rounded-[24px] space-y-3 border border-border/30 hover:border-border/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {r.reviewer?.display_name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="font-display text-sm font-bold">
                            {r.reviewer?.display_name || 'Student'}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            r.role === 'as_lender' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {r.role === 'as_lender' ? 'Lender Review' : 'Renter Review'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= r.rating ? 'fill-amber-400' : 'text-[var(--border-color)]'}
                          />
                        ))}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-[var(--foreground)]/80 leading-relaxed pl-12">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
