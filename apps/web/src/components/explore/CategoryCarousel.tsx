'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ListingCard } from './ListingCard';

interface CategoryCarouselProps {
  title: string;
  categorySlug: string;
  items: any[]; // We'll refine this type later
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: 'spring' as const, 
      stiffness: 150, 
      damping: 20 
    } 
  },
};

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
          <h2 className="font-syne text-3xl md:text-4xl font-extrabold tracking-tighter hover:opacity-80 transition-opacity py-1 leading-normal">
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
      <motion.div 
        ref={scrollRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {items.map((item, index) => (
          <motion.div key={item.id || index} variants={itemVariants} className="snap-start shrink-0 w-[72vw] md:w-[calc(20%-13px)]">
            <ListingCard item={item} />
          </motion.div>
        ))}
        
        {/* See All Card */}
        <motion.div variants={itemVariants} className="snap-start shrink-0 w-[72vw] md:w-[calc(20%-13px)]">
          <Link 
            href={`/?category=${categorySlug}`}
            className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-border/15 bg-transparent flex flex-col items-center justify-center gap-4 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 hover:shadow-sm transition-all duration-300 group/card cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-surface border border-border/10 shadow-sm flex items-center justify-center group-hover/card:bg-[var(--accent)] group-hover/card:text-black group-hover/card:scale-110 group-hover/card:border-[var(--accent)] transition-all duration-300">
              <ArrowRight size={22} className="group-hover/card:translate-x-0.5 transition-transform duration-300" />
            </div>
            <span className="font-syne font-bold text-lg text-foreground/60 group-hover/card:text-[var(--accent)] transition-colors duration-300 tracking-wide">See all</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
