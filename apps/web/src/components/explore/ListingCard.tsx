'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  item: any;
}

export function ListingCard({ item }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Mock data for display
  const title = item?.title || 'Sony A7IV Camera Body';
  const city = item?.city || 'Johar Town / LUMS';
  const rating = item?.rating || 4.9;
  const price = item?.price || 2500;
  const imageUrl = item?.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop';
  const isFeatured = item?.isFeatured || Math.random() > 0.7;

  return (
    <Link href={`/listings/${item?.id || '1'}`} className="group block cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface border border-border/5">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-border/10">
            <span className="text-[10px] font-bold tracking-wider uppercase">Featured ✨</span>
          </div>
        )}

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
      <div className="space-y-0.5 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-syne font-semibold text-sm truncate">{title}</h3>
          <div className="flex items-center gap-1 shrink-0 text-foreground/80">
            <Star size={12} className="fill-current" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="text-xs text-foreground/50 truncate">
          📍 {city}
        </div>
        
        <div className="pt-1">
          <span className="text-sm font-bold text-[var(--accent)]">Rs. {price.toLocaleString()}</span>
          <span className="text-xs text-foreground/60 font-medium"> / day</span>
        </div>
      </div>
    </Link>
  );
}
