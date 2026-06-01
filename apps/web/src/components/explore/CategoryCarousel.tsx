'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ListingCard } from './ListingCard';

interface CategoryCarouselProps {
  title: string;
  categorySlug: string;
  items: any[]; // We'll refine this type later
}

export function CategoryCarousel({ title, categorySlug, items }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={`/?category=${categorySlug}`} 
          className="group/link flex items-center gap-2"
        >
          <h2 className="font-syne text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            {title}
          </h2>
          <ArrowRight size={20} className="text-foreground/50 group-hover/link:text-[var(--accent)] group-hover/link:translate-x-1 transition-all" />
        </Link>

        {/* Desktop scroll buttons */}
        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-border/10 flex items-center justify-center bg-surface hover:bg-border/10 hover:border-border/30 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft size={18} className="text-foreground/70" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-border/10 flex items-center justify-center bg-surface hover:bg-border/10 hover:border-border/30 transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight size={18} className="text-foreground/70" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {items.map((item, index) => (
          <div key={item.id || index} className="snap-start shrink-0 w-[280px] md:w-[320px]">
            <ListingCard item={item} />
          </div>
        ))}
        
        {/* See All Card */}
        <div className="snap-start shrink-0 w-[280px] md:w-[320px]">
          <Link 
            href={`/?category=${categorySlug}`}
            className="w-full h-full min-h-[300px] rounded-2xl border-2 border-dashed border-border/10 flex flex-col items-center justify-center gap-4 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all group/card cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface border border-border/10 flex items-center justify-center group-hover/card:bg-[var(--accent)] group-hover/card:text-black transition-colors">
              <ArrowRight size={20} />
            </div>
            <span className="font-syne font-bold text-lg group-hover/card:text-[var(--accent)] transition-colors">See all</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
