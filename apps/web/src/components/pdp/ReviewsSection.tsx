'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApiClient } from '@/lib/api-client';

interface Reviewer {
  display_name: string;
  avatar_url: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  createdAt: string;
  reviewer: Reviewer;
}

interface ReviewsData {
  reviews: ReviewItem[];
  pagination: { page: number; limit: number; total: number };
  ratings: { average: number };
}

interface ReviewsSectionProps {
  listingId: string;
  initialAverage?: number;
  initialCount?: number;
}

const PAGE_LIMIT = 5;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse flex gap-4 py-6 border-b border-border/10 last:border-0">
      <div className="w-9 h-9 rounded-full bg-border/15 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-border/15" />
        <div className="h-2.5 w-16 rounded bg-border/10" />
        <div className="h-3 w-full rounded bg-border/10 mt-2" />
        <div className="h-3 w-2/3 rounded bg-border/10" />
      </div>
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const filled = Math.round(rating);
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= filled ? 'text-amber-400 fill-amber-400' : 'text-border/30 fill-current'}`}
        />
      ))}
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewItem }) {
  const avatar =
    review.reviewer.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer.display_name)}&background=random&size=80`;

  return (
    <div className="flex gap-4 py-6 border-b border-border/10 last:border-0">
      <img
        src={avatar}
        alt={review.reviewer.display_name}
        className="w-9 h-9 rounded-full object-cover shrink-0 border border-border/10"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm font-syne">{review.reviewer.display_name}</span>
          <span className="text-xs text-foreground/40">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </span>
        </div>
        <Stars rating={review.rating} />
        {review.comment && (
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ReviewsSection({ listingId, initialAverage = 0, initialCount = 0 }: ReviewsSectionProps) {
  const api = useApiClient();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);

  const fetchReviews = useCallback(
    async (p: number, append: boolean) => {
      try {
        const res = await api
          .get('reviews', {
            searchParams: { listingId, limit: PAGE_LIMIT, page: p, sort: 'recent', role: 'as_lender' },
          })
          .json<{ success: boolean; data: ReviewsData }>();

        if (res.success) {
          setData((prev) =>
            append && prev
              ? { ...res.data, reviews: [...prev.reviews, ...res.data.reviews] }
              : res.data
          );
          const loaded = (p - 1) * PAGE_LIMIT + res.data.reviews.length;
          setAllLoaded(loaded >= res.data.pagination.total);
        }
      } catch {
        // degrade silently
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [api, listingId]
  );

  useEffect(() => {
    setLoading(true);
    fetchReviews(1, false);
  }, [listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchReviews(next, true);
  };

  const average = data?.ratings.average ?? initialAverage;
  const total   = data?.pagination.total ?? initialCount;

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-10 pt-8 border-t border-border/10" id="reviews-section">
        <div className="h-6 w-28 rounded bg-border/15 animate-pulse mb-6" />
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // ── No reviews ─────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="mt-10 pt-8 border-t border-border/10" id="reviews-section">
        <h2 className="text-xl font-bold font-syne mb-6">Reviews</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map((i) => <Star key={i} className="w-5 h-5 text-border/25 fill-current" />)}
          </div>
          <p className="font-syne font-semibold text-foreground/50 text-sm">No reviews yet</p>
          <p className="text-xs text-foreground/35 mt-1">Be the first to rent and share your experience.</p>
        </div>
      </div>
    );
  }

  // ── Has reviews ────────────────────────────────────────────────────────
  return (
    <div className="mt-10 pt-8 border-t border-border/10" id="reviews-section">

      {/* Heading + inline rating summary */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold font-syne">Reviews</h2>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold font-syne leading-none">{average.toFixed(1)}</span>
          <Stars rating={average} size="sm" />
          <span className="text-xs text-foreground/40 font-medium">({total})</span>
        </div>
      </div>

      {/* Review list */}
      {data!.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}

      {/* Load more */}
      {!allLoaded && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border/20 text-sm font-semibold text-foreground/60 hover:bg-border/5 hover:text-foreground transition-all duration-200 disabled:opacity-50"
        >
          {loadingMore ? (
            <span className="w-4 h-4 border-2 border-foreground/25 border-t-foreground/60 rounded-full animate-spin inline-block" />
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show more</>
          )}
        </button>
      )}
    </div>
  );
}
