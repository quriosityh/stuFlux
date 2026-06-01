'use client';

import { ListingCard } from './ListingCard';

interface ListingGridProps {
  items: any[];
}

export function ListingGrid({ items }: ListingGridProps) {
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

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {items.map((item, index) => (
          <div key={item.id || index}>
            <ListingCard item={item} />
          </div>
        ))}
      </div>

      {/* Load More Trigger (V1: Button) */}
      <div className="mt-12 flex justify-center">
        <button className="liquid-button px-8 py-3 text-sm font-bold bg-surface border border-border/10 hover:border-[var(--accent)]/50 transition-all">
          Show More
        </button>
      </div>
    </div>
  );
}
