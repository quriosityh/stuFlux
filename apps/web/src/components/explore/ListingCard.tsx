'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface ListingCardProps {
  item: any;
}

export function ListingCard({ item }: ListingCardProps) {
  // Map API response fields to display values
  const title = item?.title || 'Untitled Listing';
  const area = item?.area || item?.city || '';
  const price = item?.daily_rate ?? item?.price ?? 0;

  // `rating` and `review_count` are calculated by the listings API from renter reviews.
  const rating = item?.rating == null ? null : Number(item.rating);

  // Primary photo: try photos array first, then thumbnail, then imageUrl fallback
  const primaryPhoto = item?.photos?.find((p: any) => p.is_primary)?.url
    ?? item?.photos?.[0]?.url
    ?? item?.photo?.thumbnail_url
    ?? item?.photo?.url
    ?? item?.imageUrl;

  return (
    <Link href={{ pathname: `/listings/${item?.id || '1'}` }} className="group block cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3.5 bg-surface border border-border/5">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          {primaryPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryPhoto}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface to-border/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-border/5 border border-border/10 flex items-center justify-center text-foreground/20 text-2xl shadow-inner">
                📦
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Card Content: Structured & Organized */}
      <div className="space-y-1 px-1">
        {/* Row 1: Title & Rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-[14px] sm:text-[15px] leading-snug truncate text-foreground flex-1">
            {title}
          </h3>
          {rating !== null ? (
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold text-[12px] sm:text-[13px]">
              <Star size={14} className="fill-amber-500 stroke-none" />
              <span>{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[11px] sm:text-[12px] font-bold text-foreground/45 bg-foreground/5 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              New
            </span>
          )}
        </div>
        
        {/* Row 2: Location/Area & Delivery */}
        <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-muted-foreground font-medium">
          <div className="truncate flex items-center gap-1">
            <span className="opacity-70">📍</span>
            <span>{area || 'Location N/A'}</span>
          </div>
          {item?.delivery_available && (
            <span className="shrink-0 text-sm leading-none" title="Delivery Available">🚚</span>
          )}
        </div>
        
        {/* Row 3: Price & Booking metrics */}
        <div className="flex items-baseline justify-between pt-1 border-t border-border/5">
          <div className="font-bold text-[13px] sm:text-[14px] text-foreground">
            Rs. {price.toLocaleString()}<span className="text-muted-foreground text-[10px] sm:text-[11px] font-medium">/day</span>
          </div>
          {item?.booking_count > 0 && (
            <span className="text-[10px] sm:text-[11px] text-muted-foreground/75 font-medium">
              {item.booking_count} rentals
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
