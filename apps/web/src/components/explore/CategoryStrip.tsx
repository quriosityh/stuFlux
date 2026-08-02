'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  image: string;
}

export const CATEGORIES_LIST: CategoryItem[] = [
  { id: 'power-energy',      label: 'Power & Energy',      description: 'Generators, UPS units, solar lamps, extension setups, inverters', icon: '⚡', image: '/images/categories/power.jpeg' },
  { id: 'tools-home-fix',   label: 'Tools & Home Fix',    description: 'Power drills, ladders, pressure washers, paint rollers, tile cutters', icon: '🔧', image: '/images/categories/tools.png' },
  { id: 'cameras-creators', label: 'Cameras & Creators',  description: 'DSLRs, lenses, tripods, ring lights, mics, audio interfaces, gimbals', icon: '📷', image: '/images/categories/camera.png' },
  { id: 'music-audio',      label: 'Music & Audio',       description: 'Guitars, keyboards, DJ controllers, amps, portable speakers', icon: '🎸', image: '/images/categories/music1.jpeg' },
  { id: 'clothing-fashion', label: 'Clothing & Fashion',  description: 'Sherwani, lehenga, formal suits, cultural dress, accessories', icon: '👕', image: '/images/categories/clothing.jpeg' },
  { id: 'hosting-party',    label: 'Hosting & Party',     description: 'Speakers, projectors, decoration sets, fairy lights, crockery', icon: '🎉', image: '/images/categories/hosting.jpeg' },
  { id: 'bikes-boards',     label: 'Bikes & Boards',      description: 'Bicycles, e-scooters, skateboards, rollerblades', icon: '🚲', image: '/images/categories/cycle.jpeg' },
  { id: 'travel-outdoors',  label: 'Travel & Outdoors',   description: 'Tents, hiking backpacks, sleeping bags, camping gear', icon: '⛺', image: '/images/categories/travel.jpg' },
];

interface CategoryStripProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string) => void;
}

export function CategoryStrip({ activeCategory, onCategoryChange }: CategoryStripProps) {
  return (
    <div className="w-full border-b border-border/5 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-4 sm:px-6 md:w-[82%] md:px-0 mx-auto">
        <div className="flex w-full gap-4 sm:gap-5 md:gap-0 overflow-x-auto md:overflow-visible scrollbar-hide py-3 sm:py-4 md:py-5 px-1 sm:px-2 md:px-0 snap-x justify-start md:justify-between">
          {CATEGORIES_LIST.map((cat, i) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
                onClick={() => onCategoryChange(isActive ? 'all' : cat.id)}
                className={cn(
                  'relative flex shrink-0 flex-col items-center gap-2 min-w-max pb-2.5 transition-colors snap-start hover:text-foreground group',
                  isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
                )}
              >
                <div
                  className={cn(
                    'w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] md:w-[88px] md:h-[88px] rounded-full overflow-hidden mb-1.5 transition-all duration-300 shadow-md border-2 relative',
                    isActive
                      ? 'scale-110 border-[var(--accent)] ring-2 ring-[var(--accent)]/30 ring-offset-2 ring-offset-background'
                      : 'border-border/10 opacity-90 hover:opacity-100 hover:scale-105 hover:border-[var(--accent)]/40 hover:shadow-lg'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="max-w-[88px] text-center text-[11px] sm:text-sm font-medium leading-tight tracking-wide flex items-center justify-center gap-1">
                  <span>{cat.label}</span>
                </span>

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
