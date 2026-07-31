'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, MapPin, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  item: any;
}

export function ListingCard({ item }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Map API response fields to display values
  const title = item?.title || 'Untitled Listing';
  const area = item?.area || item?.city || '';
  const price = item?.daily_rate ?? item?.price ?? 0;
  // Primary photo: try photos array first, then thumbnail, then imageUrl fallback
  const primaryPhoto = item?.photos?.find((p: any) => p.is_primary)?.url
    ?? item?.photos?.[0]?.url
    ?? item?.photo?.thumbnail_url
    ?? item?.photo?.url
    ?? item?.imageUrl
    ?? null;
  const isFeatured = item?.isFeatured || false;

  return (
    <Link href={{ pathname: `/listings/${item?.id || '1'}` }} className="group block cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface border border-border/5">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
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

        {/* Featured Badge Removed */}

        {/* Save Button (Heart) */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="absolute top-3 right-3 p-1.5 z-10"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Heart 
              size={24} 
              className={cn(
                "drop-shadow-md transition-colors",
                isSaved ? "fill-[var(--accent)] text-[var(--accent)]" : "fill-black/30 text-white"
              )} 
            />
          </motion.div>
        </button>
      </div>

      {/* Card Content */}
      <div className="space-y-1.5 px-1 mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-syne font-bold text-[17px] leading-tight truncate text-foreground/90">{title}</h3>
        </div>
        
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={14} className="text-foreground/40 shrink-0" />
            <span className="truncate font-medium tracking-wide">{area || 'Location N/A'}</span>
          </div>
          {item?.delivery_available && (
            <Truck size={14} className="text-[var(--accent)] shrink-0" />
          )}
        </div>
        
        <div className="pt-1.5 flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black tracking-tight text-foreground/90">
              <span className="text-[13px] font-semibold text-foreground/50 mr-0.5">Rs.</span>
              {price.toLocaleString()}
            </span>
            <span className="text-[11px] text-foreground/40 font-medium uppercase tracking-wider">/day</span>
          </div>
          {item?.booking_count > 0 && (
            <span className="text-[11px] font-medium text-foreground/40">
              &middot; {item.booking_count} rentals
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
