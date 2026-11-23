'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ListingSort = 'popular' | 'newest' | 'rating_desc' | 'rate_asc' | 'rate_desc';

export interface FilterSidebarProps {
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  minRate: string;
  maxRate: string;
  onApplyPrice: (min: string, max: string) => void;
  deliveryOnly: boolean;
  onToggleDelivery: (val: boolean) => void;
  activeFilterCount: number;
  onClearAll: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  totalResults: number;
}

const SORT_CHIPS: { value: ListingSort; label: string; icon: string }[] = [
  { value: 'popular', label: 'Trending', icon: '🔥' },
  { value: 'newest', label: 'Newest', icon: '✨' },
  { value: 'rating_desc', label: 'Top Rated', icon: '⭐' },
  { value: 'rate_asc', label: 'Price: Low to High', icon: '🏷️' },
  { value: 'rate_desc', label: 'Price: High to Low', icon: '💎' },
];

export function FilterSidebar({
  sort,
  onSortChange,
  minRate,
  maxRate,
  onApplyPrice,
  deliveryOnly,
  onToggleDelivery,
  activeFilterCount,
  onClearAll,
  isOpenMobile,
  setIsOpenMobile,
  totalResults,
}: FilterSidebarProps) {
  const [localMin, setLocalMin] = useState(minRate);
  const [localMax, setLocalMax] = useState(maxRate);

  useEffect(() => {
    setLocalMin(minRate);
  }, [minRate]);

  useEffect(() => {
    setLocalMax(maxRate);
  }, [maxRate]);

  const handlePriceBlur = () => {
    onApplyPrice(localMin, localMax);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onApplyPrice(localMin, localMax);
    }
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Sidebar Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-border/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[var(--accent)]" />
          <h3 className="font-syne font-bold text-xs uppercase tracking-wider text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-foreground/50 hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            <RefreshCw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* FILTER GROUP 1: Sort Options */}
      <div>
        <h4 className="text-[10px] font-bold tracking-wider uppercase text-foreground/50 mb-2">
          Sort By
        </h4>
        <div className="flex flex-col gap-1">
          {SORT_CHIPS.map((chip) => {
            const isActive = sort === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => onSortChange(chip.value)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border',
                  isActive
                    ? 'bg-[var(--accent)]/12 text-[var(--accent)] border-[var(--accent)]/30 font-bold shadow-sm'
                    : 'bg-transparent border-transparent text-foreground/70 hover:bg-surface/60 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{chip.icon}</span>
                  <span>{chip.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER GROUP 2: Price Range (PKR) */}
      <div>
        <h4 className="text-[10px] font-bold tracking-wider uppercase text-foreground/50 mb-2">
          Daily Rate (Rs.)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-foreground/40 block mb-1">Min (Rs.)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="w-full bg-surface/50 px-3 py-2 rounded-xl border border-border/10 text-xs font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[var(--accent)]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-foreground/40 block mb-1">Max (Rs.)</label>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="w-full bg-surface/50 px-3 py-2 rounded-xl border border-border/10 text-xs font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[var(--accent)]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* FILTER GROUP 3: Fulfilment Options */}
      <div>
        <h4 className="text-[10px] font-bold tracking-wider uppercase text-foreground/50 mb-2">
          Fulfilment
        </h4>
        <button
          onClick={() => onToggleDelivery(!deliveryOnly)}
          className={cn(
            'w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border cursor-pointer',
            deliveryOnly
              ? 'bg-[var(--accent)]/12 text-[var(--accent)] border-[var(--accent)]/30 font-bold'
              : 'bg-surface/40 border-border/10 text-foreground/70 hover:bg-surface/80 hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🚚</span>
            <span>Delivery Available</span>
          </div>
          <div
            className={cn(
              'w-3.5 h-3.5 rounded flex items-center justify-center transition-all border',
              deliveryOnly
                ? 'bg-[var(--accent)] border-[var(--accent)] text-black'
                : 'border-border/30 bg-background/50'
            )}
          >
            {deliveryOnly && <span className="text-[9px] font-black">✓</span>}
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sleek Unboxed Sidebar with Vertical Divider */}
      <aside className="hidden md:block w-56 shrink-0 sticky top-[110px] self-start pr-6 border-r border-border/10">
        {filterContent}
      </aside>

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 md:hidden"
              onClick={() => setIsOpenMobile(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-background chrome-card !rounded-t-3xl !rounded-b-none z-[60] md:hidden flex flex-col border-t border-border/20 shadow-2xl"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/10 shrink-0">
                <div className="w-10" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-1 rounded-full bg-foreground/20" />
                  <span className="font-syne font-bold text-sm">Filters & Sorting</span>
                </div>
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-surface text-foreground/70"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sheet Body — flex-1 + min-h-0 is required for overflow-y-auto to work inside flex column */}
              <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
                {filterContent}
              </div>

              {/* Sheet Footer CTA — in normal flow (not absolute) so it doesn't overlap content */}
              <div className="shrink-0 px-5 py-4 bg-background border-t border-border/10 flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-4 py-3 text-xs font-bold text-foreground/60 hover:text-foreground border border-border/20 rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="hyper-liquid flex-1 py-3 text-black font-bold rounded-xl shadow-lg text-center text-xs"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
