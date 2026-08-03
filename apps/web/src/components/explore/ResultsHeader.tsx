'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ListingSort } from './FilterSidebar';

const sortOptions: { value: ListingSort; label: string; icon: string }[] = [
  { value: 'popular', label: 'Trending', icon: '🔥' },
  { value: 'newest', label: 'Newest', icon: '✨' },
  { value: 'rate_asc', label: 'Price: Low to High', icon: '🏷️' },
  { value: 'rate_desc', label: 'Price: High to Low', icon: '💎' },
];

interface ResultsHeaderProps {
  count: number;
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
  onClearAll?: () => void;
}

export function ResultsHeader({
  count,
  sort,
  onSortChange,
  onOpenMobileFilters,
  activeFilterCount = 0,
  onClearAll,
}: ResultsHeaderProps) {
  const selectedOption = sortOptions.find((option) => option.value === sort) ?? sortOptions[0];

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
      {/* Left: Total Count */}
      <div className="flex items-center gap-2">
        <span className="font-syne font-bold text-base sm:text-lg md:text-xl tracking-tight text-foreground">
          {count === 1 ? '1 item found' : `${count} items found`}
        </span>
        {activeFilterCount > 0 && (
          <span className="hidden sm:inline-flex text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Right: Small Filter Icon Button on Mobile & Sort Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Small Filter Icon Button (Right side) */}
        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            aria-label="Open filters"
            className="md:hidden relative p-2.5 rounded-full chrome-card border border-border/20 shadow-sm flex items-center justify-center text-foreground hover:border-[var(--accent)]/40 active:scale-95 transition-all"
          >
            <SlidersHorizontal size={15} className="text-[var(--accent)]" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-black flex items-center justify-center shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {activeFilterCount > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="hidden sm:inline-flex text-xs font-bold text-foreground/50 hover:text-[var(--accent)] transition-colors"
          >
            Clear all
          </button>
        )}

        <div className="relative group">
          <button className="flex items-center gap-2 chrome-card px-3.5 py-2 rounded-full text-xs font-semibold hover:border-border/30 transition-colors shadow-sm">
            <span className="text-foreground/50 hidden sm:inline">Sort:</span>
            <span>{selectedOption.icon} {selectedOption.label}</span>
            <ChevronDown size={14} className="text-foreground/50 group-hover:rotate-180 transition-transform duration-200" />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-52 chrome-card rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30 border border-border/20">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                  sort === option.value
                    ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold'
                    : 'hover:bg-surface text-foreground/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </span>
                {sort === option.value && <span className="text-[var(--accent)] font-black">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
