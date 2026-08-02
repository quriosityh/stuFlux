'use client';

import { MapPin, Star } from 'lucide-react';

interface ListingMetaProps {
  title: string;
  city: string;
  reviewCount?: number;
  rating?: number;
}

export function ListingMeta({ title, city, reviewCount = 0, rating = 0 }: ListingMetaProps) {
  const isZeroReviews = reviewCount === 0;
  const hasRating = reviewCount > 0;

  // Calculate percentage width for the filled stars layer
  const fillPercentage = (rating / 5) * 100;

  const gridColsClass = isZeroReviews 
    ? "grid-cols-[1fr_1px_1fr]" 
    : "grid-cols-[1fr_1px_1fr_1px_1fr]";

  return (
    <div className="w-full my-4 md:mb-8" id="details-section">
      
      {/* MOBILE TITLE */}
      <div className="md:hidden pt-2 pb-6">
        <h1 className="text-3xl font-bold font-syne leading-tight text-foreground text-center">
          {title}
        </h1>
      </div>

      {/* STATS GRID (Shared Mobile + Desktop) */}
      <div className={`grid ${gridColsClass} grid-rows-2 gap-x-2 sm:gap-x-6 gap-y-2 sm:gap-y-3 items-center justify-items-center py-5 sm:py-6 px-2 sm:px-8 border border-border/20 rounded-2xl sm:rounded-3xl w-full`}>
        
        {/* ROW 1: Top Elements */}
        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />

        {/* First Divider */}
        <div className="w-px h-full bg-border/20 row-span-2" />

        {/* Rating Top */}
        {!hasRating ? (
          <span className="text-lg sm:text-xl font-bold font-syne leading-none text-foreground/50">New</span>
        ) : (
          <span className="text-xl sm:text-2xl font-bold font-syne leading-none">{rating.toFixed(2)}</span>
        )}

        {/* Second Divider */}
        {!isZeroReviews && (
          <div className="w-px h-full bg-border/20 row-span-2" />
        )}

        {/* Reviews Top */}
        {!isZeroReviews && (
          <span className="text-xl sm:text-2xl font-bold font-syne leading-none">{reviewCount}</span>
        )}

        {/* ROW 2: Bottom Elements */}
        <span className="text-xs sm:text-sm font-semibold text-center leading-tight text-foreground/80 max-w-[100px]">
          {city}
        </span>

        {/* Rating Bottom (Stars) */}
        {!hasRating ? (
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-border/30" />
        ) : (
          <div className="relative inline-flex items-center justify-center scale-90 sm:scale-100">
            <div className="flex text-border/30">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              ))}
            </div>
            <div 
              className="absolute top-0 left-0 flex text-accent overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 fill-current" />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Bottom */}
        {!isZeroReviews && (
          <button className="text-xs sm:text-sm text-foreground/60 underline decoration-border/50 underline-offset-4 font-medium hover:text-foreground transition-colors">
            {reviewCount === 1 ? 'Review' : 'Reviews'}
          </button>
        )}

      </div>
    </div>
  );
}
