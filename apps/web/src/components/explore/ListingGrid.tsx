'use client';

import { motion } from 'framer-motion';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  items: any[];
  total?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 150,
      damping: 18,
    },
  },
};

export function ListingGrid({ items, total }: ListingGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-surface border border-border/10 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="font-syne text-2xl font-bold mb-2">No exact matches</h3>
        <p className="text-foreground/60 max-w-md">
          Try changing or removing some of your filters or adjusting your search area.
        </p>
        <button className="mt-6 px-6 py-2 rounded-full border border-border/20 hover:border-foreground/50 transition-colors font-medium">
          Clear all filters
        </button>
      </div>
    );
  }

  // Only show the button if total is provided and there are more items server-side
  const hasMore = total !== undefined && items.length < total;

  return (
    <div className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {items.map((item, index) => (
          <motion.div key={item.id || index} variants={itemVariants}>
            <ListingCard item={item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Show More — only rendered when there are more results than currently displayed */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 text-sm font-bold bg-surface border border-border/10 hover:border-foreground/30 hover:bg-transparent rounded-full transition-all cursor-pointer">
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
