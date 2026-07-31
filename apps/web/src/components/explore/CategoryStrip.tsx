'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wrench, Camera, Music, Shirt, PartyPopper, Bike, Tent } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'power-energy', label: 'Power & Energy', icon: Zap },
  { id: 'tools-home-fix', label: 'Tools & Home Fix', icon: Wrench },
  { id: 'cameras-creators', label: 'Cameras & Creators', icon: Camera },
  { id: 'music-audio', label: 'Music & Audio', icon: Music },
  { id: 'clothing-fashion', label: 'Clothing & Fashion', icon: Shirt },
  { id: 'hosting-party', label: 'Hosting & Party', icon: PartyPopper },
  { id: 'bikes-boards', label: 'Bikes & Boards', icon: Bike },
  { id: 'travel-outdoors', label: 'Travel & Outdoors', icon: Tent },
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
                  "relative flex flex-col items-center gap-2 min-w-max pb-2 transition-colors snap-start hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-foreground/60"
                )}
              >
                <cat.icon size={24} className={cn("transition-transform", isActive ? "scale-110 text-[var(--accent)]" : "")} />
                <span className="text-xs tracking-wide">{cat.label}</span>
                
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
