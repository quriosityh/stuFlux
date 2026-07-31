'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'power-energy', label: 'Power & Energy', image: '/images/categories/power-energy.png' },
  { id: 'tools-home-fix', label: 'Tools & Home Fix', image: '/images/categories/tools-home-fix.png' },
  { id: 'cameras-creators', label: 'Cameras & Creators', image: '/images/categories/cameras-creators.png' },
  { id: 'music-audio', label: 'Music & Audio', image: '/images/categories/music-audio.png' },
  { id: 'clothing-fashion', label: 'Clothing & Fashion', image: '/images/categories/clothing-fashion.png' },
  { id: 'hosting-party', label: 'Hosting & Party', image: '/images/categories/hosting-party.png' },
  { id: 'bikes-boards', label: 'Bikes & Boards', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=150&h=150&q=80' }, // Yellow skateboard
  { id: 'travel-outdoors', label: 'Travel & Outdoors', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=150&h=150&q=80' }, // Bright yellow tent
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: 'spring' as const, 
      stiffness: 200, 
      damping: 25 
    } 
  },
};

interface CategoryStripProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string) => void;
}

export function CategoryStrip({ activeCategory, onCategoryChange }: CategoryStripProps) {

  return (
    <div className="w-full border-b border-border/5 bg-background sticky top-[48px] md:top-[72px] z-40 shadow-sm">
      <div className="w-[85%] mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-8 overflow-x-auto scrollbar-hide py-4 snap-x"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            
            return (
              <motion.button
                variants={itemVariants}
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2.5 min-w-max pb-3 transition-colors snap-start hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-foreground/60"
                )}
              >
                <div 
                  className={cn(
                    "w-[56px] h-[56px] rounded-full overflow-hidden mb-1 transition-all duration-300 shadow-sm border border-border/10", 
                    isActive ? "scale-105 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100 grayscale-[20%] hover:grayscale-0 hover:scale-105"
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
        </motion.div>
      </div>
    </div>
  );
}
