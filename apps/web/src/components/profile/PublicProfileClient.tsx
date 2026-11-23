'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  User, MapPin, Calendar, ShieldCheck, Star,
  TrendingUp, ShoppingBag, PackageCheck,
} from 'lucide-react';
import { ListingCard } from '@/components/explore/ListingCard';

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
  daily_rate?: number;
  area?: string;
  category_id?: string;
  photo?: { url?: string; thumbnail_url?: string } | null;
  photos?: Array<{ is_primary?: boolean; url?: string }>;
  rating?: number | null;
  delivery_available?: boolean;
  booking_count?: number;
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
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [reviewFilter, setReviewFilter] = useState<'as_lender' | 'as_renter'>('as_lender');

  const stats = profile.stats;

  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : 'Jun 2026';

  const areaLabel = useMemo(() => {
    if (!profile.area) return null;
    return getAreaById(profile.area, LAHORE_AREAS_DATA)?.name ?? profile.area;
  }, [profile.area]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => r.role === reviewFilter);
  }, [reviews, reviewFilter]);

  const lenderReviewCount = useMemo(() => reviews.filter(r => r.role === 'as_lender').length, [reviews]);
  const renterReviewCount = useMemo(() => reviews.filter(r => r.role === 'as_renter').length, [reviews]);

  // Map listings to the shape ListingCard expects
  const cardListings = useMemo(() => listings.map(l => ({
    ...l,
    daily_rate: l.daily_rate ?? l.price_per_day,
    photo: l.photo || undefined,
  })), [listings]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10">

        {/* ── PROFILE HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-[var(--border-color)] ring-offset-2 ring-offset-[var(--background)] shrink-0">
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

          {/* Name + meta */}
          <div>
            <div className="flex items-center justify-center gap-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {profile.display_name}
              </h1>
              {profile.phone_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1.5 text-xs text-[var(--foreground)]/50 font-medium">
              {areaLabel && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[var(--accent)]" />
                  {areaLabel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-[var(--accent)]" />
                Joined {memberSince}
              </span>
            </div>
          </div>

          {/* Reputation */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={15} className="text-blue-400" />
              <span className="font-bold">
                {stats?.lender_rating_avg ? (
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {stats.lender_rating_avg}
                    <span className="text-xs font-normal text-[var(--foreground)]/40">
                      ({stats.lender_rating_count}) as lender
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-[var(--foreground)]/40">New lender</span>
                )}
              </span>
            </div>
            <div className="w-px h-4 bg-[var(--border-color)]" />
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag size={15} className="text-purple-400" />
              <span className="font-bold">
                {stats?.renter_rating_avg ? (
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {stats.renter_rating_avg}
                    <span className="text-xs font-normal text-[var(--foreground)]/40">
                      ({stats.renter_rating_count}) as renter
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-[var(--foreground)]/40">New renter</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ── TABS ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 border-b border-[var(--border-color)] mb-8">
          <button
            id="public-tab-listings-btn"
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'listings'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70'
            }`}
          >
            <span className="flex items-center gap-2">
              <PackageCheck size={15} />
              Listings
              <span className="text-xs font-normal text-[var(--foreground)]/40">({listings.length})</span>
            </span>
          </button>

          <button
            id="public-tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star size={15} />
              Reviews
              <span className="text-xs font-normal text-[var(--foreground)]/40">({reviews.length})</span>
            </span>
          </button>
        </div>

        {/* ── LISTINGS TAB ───────────────────────────────────────────── */}
        {activeTab === 'listings' && (
          <div className="animate-in fade-in duration-300">
            {cardListings.length === 0 ? (
              <div className="py-20 text-center">
                <PackageCheck size={40} className="mx-auto text-[var(--foreground)]/15 mb-3" />
                <p className="text-sm text-[var(--foreground)]/40 font-medium">
                  No active listings
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {cardListings.map((l) => (
                  <ListingCard key={l.id} item={l} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-300">
            {/* Filter: As Lender | As Renter */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setReviewFilter('as_lender')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  reviewFilter === 'as_lender'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface)] text-[var(--foreground)]/50 border border-[var(--border-color)] hover:text-[var(--foreground)]'
                }`}
              >
                As Lender ({lenderReviewCount})
              </button>
              <button
                onClick={() => setReviewFilter('as_renter')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  reviewFilter === 'as_renter'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface)] text-[var(--foreground)]/50 border border-[var(--border-color)] hover:text-[var(--foreground)]'
                }`}
              >
                As Renter ({renterReviewCount})
              </button>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center">
                <Star size={40} className="mx-auto text-[var(--foreground)]/15 mb-3" />
                <p className="text-sm text-[var(--foreground)]/40 font-medium">
                  No reviews {reviewFilter === 'as_lender' ? 'as lender' : 'as renter'} yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="flex gap-3 p-4 rounded-2xl bg-[var(--surface)]/50 border border-[var(--border-color)] hover:border-[var(--border-color)]/80 transition-colors">
                    {/* Reviewer avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {r.reviewer?.avatar_url ? (
                        <img src={r.reviewer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        r.reviewer?.display_name?.[0] || 'S'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate">
                          {r.reviewer?.display_name || 'Student'}
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-color)]'}
                            />
                          ))}
                        </div>
                      </div>

                      {r.listing && (
                        <p className="text-[11px] text-[var(--foreground)]/40 mt-0.5">
                          on {r.listing.title}
                        </p>
                      )}

                      {r.comment && (
                        <p className="text-xs text-[var(--foreground)]/70 leading-relaxed mt-2">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                    </div>
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
