'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'power-energy',      label: 'Power & Energy',      image: '/images/categories/power-energy.jpg' },
  { id: 'tools-home-fix',   label: 'Tools & Home Fix',    image: '/images/categories/tools-home-fix.jpg' },
  { id: 'cameras-creators', label: 'Cameras & Creators',  image: '/images/categories/cameras-creators.jpg' },
  { id: 'music-audio',      label: 'Music & Audio',       image: '/images/categories/music-audio.jpg' },
  { id: 'clothing-fashion', label: 'Clothing & Fashion',  image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=160&h=160&q=90' },
  { id: 'hosting-party',    label: 'Hosting & Party',     image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=160&h=160&q=90' },
  { id: 'bikes-boards',     label: 'Bikes & Boards',      image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=160&h=160&q=90' },
  { id: 'travel-outdoors',  label: 'Travel & Outdoors',   image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=160&h=160&q=90' },
];

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 25 },
  },
};

interface CategoryStripProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string) => void;
}

// Collapsed header height (after search bar folds away on scroll)
const COLLAPSED_NAV_H = 72;
// Scroll threshold after which the nav is considered collapsed
const SCROLL_THRESHOLD = 80;

export function CategoryStrip({ activeCategory, onCategoryChange }: CategoryStripProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // sticky — always in the flow. top changes based on whether header is expanded or collapsed.
    <div
      className={cn(
        'w-full border-b border-border/5 bg-background z-40 shadow-sm sticky transition-[top] duration-300'
      )}
      // When at page top: header is ~160px tall, strip sits below it naturally.
      // When scrolled: header collapses to 72px, strip sticks at 72px.
      style={{ top: scrolled ? COLLAPSED_NAV_H : 'var(--nav-expanded-h, 160px)' }}
    >
      <div className="w-[85%] mx-auto">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide py-4 snap-x">
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2.5 min-w-max pb-3 transition-colors snap-start hover:text-foreground',
                  isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
                )}
              >
                <div
                  className={cn(
                    'w-[72px] h-[72px] rounded-full overflow-hidden mb-1 transition-all duration-300 shadow-md border-2',
                    isActive
                      ? 'scale-110 border-[var(--accent)] ring-2 ring-[var(--accent)]/30 ring-offset-2 ring-offset-background'
                      : 'border-border/10 opacity-90 hover:opacity-100 hover:scale-105 hover:border-[var(--accent)]/40 hover:shadow-lg'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium tracking-wide">{cat.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="category-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
