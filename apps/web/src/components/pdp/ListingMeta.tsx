'use client';

import { MapPin, Star } from 'lucide-react';

interface ListingMetaProps {
  title: string;
  city: string;
  reviewCount?: number;
  rating?: number;
  condition?: string | null;
}

const CONDITION_MAP: Record<string, { label: string; emoji: string }> = {
  like_new: { label: 'Like New', emoji: '✨' },
  good: { label: 'Good', emoji: '👍' },
  fair: { label: 'Fair', emoji: '👌' },
  well_used: { label: 'Well Used', emoji: '🔧' },
};

export function ListingMeta({ title, city, reviewCount = 0, rating = 0, condition }: ListingMetaProps) {
  const hasRating = reviewCount > 0;
  const conditionInfo = condition ? CONDITION_MAP[condition] : null;

  return (
    <div className="w-full my-4 md:mb-8" id="details-section">

      {/* MOBILE TITLE */}
      <div className="md:hidden pt-2 pb-5">
        <h1 className="text-2xl font-bold font-syne leading-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* THREE-COLUMN STATS BAR */}
      <div className="grid grid-cols-3 divide-x divide-border/15 border border-border/15 rounded-2xl overflow-hidden">

        {/* ── Col 1: Condition ── */}
        <div className="flex flex-col items-center justify-center gap-1 py-4 px-3">
          {conditionInfo ? (
            <>
              <span className="text-lg leading-none">
                {conditionInfo.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-none text-foreground/80">
                {conditionInfo.label}
              </span>
              <span className="text-[10px] text-foreground/40 font-medium mt-0.5">Condition</span>
            </>
          ) : (
            <>
              <span className="text-lg leading-none text-foreground/25">—</span>
              <span className="text-[10px] text-foreground/40 font-medium mt-0.5">Condition</span>
            </>
          )}
        </div>

        {/* ── Col 2: Location ── */}
        <div className="flex flex-col items-center justify-center gap-1 py-4 px-3">
          <MapPin className="w-4 h-4 text-foreground/70 shrink-0" />
          <span className="text-[12px] font-semibold text-foreground/80 text-center leading-tight line-clamp-1 max-w-[90px]">
            {city || '—'}
          </span>
          <span className="text-[10px] text-foreground/40 font-medium">Location</span>
        </div>

        {/* ── Col 3: Rating ── */}
        <div className="flex flex-col items-center justify-center gap-1 py-4 px-3">
          {hasRating ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-syne leading-none">{rating.toFixed(1)}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 mb-0.5" />
              </div>
              <span className="text-[11px] text-foreground/60 font-medium leading-none">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
              <span className="text-[10px] text-foreground/40 font-medium mt-0.5">Rating</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold font-syne text-foreground/40">New</span>
              <span className="text-[11px] text-foreground/30 leading-none">No reviews</span>
              <span className="text-[10px] text-foreground/40 font-medium mt-0.5">Rating</span>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
