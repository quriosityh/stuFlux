'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Wrench, Music, Bike, Laptop, Book, Tent, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Gear', icon: MonitorPlay },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'vehicles', label: 'Vehicles', icon: Bike },
  { id: 'electronics', label: 'Electronics', icon: Laptop },
  { id: 'books', label: 'Books', icon: Book },
  { id: 'outdoors', label: 'Outdoors', icon: Tent },
];

export function CategoryStrip() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="w-full border-b border-border/5 bg-background sticky top-[48px] md:top-[72px] z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide py-4 snap-x">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
