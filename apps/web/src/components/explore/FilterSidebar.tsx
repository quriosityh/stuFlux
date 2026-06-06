'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchAreas, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';

export function FilterSidebar() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const [areas, setAreas] = useState<LahoreArea[]>([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [includeNearby, setIncludeNearby] = useState(false);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) return [];
    return searchAreas(areaSearch, LAHORE_AREAS_DATA, 5);
  }, [areaSearch]);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/60 mb-4">Category</h3>
        <div className="space-y-3">
          {['All Categories', 'Cameras', 'Tools', 'Music', 'Vehicles'].map((cat, i) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="category" 
                  defaultChecked={i === 1}
                  className="peer appearance-none w-5 h-5 rounded-full border border-border/20 checked:border-[var(--accent)] transition-all"
                />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent)] scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* City/Area */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/60 mb-4">Area</h3>
        
        {/* Selected Area Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {areas.map(area => (
            <div key={area.id} className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/20 text-sm">
              <span>{area.name}</span>
              <button 
                onClick={() => setAreas(areas.filter(a => a.id !== area.id))}
                className="hover:text-red-400 transition-colors ml-1"
              ><X size={14} /></button>
            </div>
          ))}
        </div>

        {/* Area Search Input */}
        <div className="relative">
          <input
            type="text"
            value={areaSearch}
            onChange={(e) => setAreaSearch(e.target.value)}
            placeholder="+ Add area..."
            className="w-full bg-surface px-4 py-2 rounded-xl border border-border/20 text-sm focus:outline-none focus:border-accent"
          />
          {areaSearch && filteredAreas.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/85 backdrop-blur-2xl border border-border/20 rounded-xl shadow-xl overflow-hidden z-10">
              {filteredAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => {
                    if (!areas.find(a => a.id === area.id)) {
                      setAreas([...areas, area]);
                    }
                    setAreaSearch('');
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-border/10 transition-colors"
                >
                  {area.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Toggle */}
        {areas.length > 0 && (
          <label className="flex items-center gap-2 mt-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={includeNearby}
                onChange={(e) => setIncludeNearby(e.target.checked)}
                className="peer appearance-none w-4 h-4 rounded border border-border/20 checked:border-[var(--accent)] transition-all"
              />
              <div className="absolute w-2 h-2 rounded-sm bg-[var(--accent)] scale-0 peer-checked:scale-100 transition-transform" />
            </div>
            <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">
              Include nearby areas (3km)
            </span>
          </label>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/60 mb-4">Price Range</h3>
        <div className="space-y-4">
          <input type="range" className="w-full accent-[var(--accent)]" min="0" max="10000" />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-foreground/50">Min</label>
              <div className="bg-surface px-3 py-2 rounded-xl border border-border/10 text-sm">Rs. 0</div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-foreground/50">Max</label>
              <div className="bg-surface px-3 py-2 rounded-xl border border-border/10 text-sm">Rs. 5,000+</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/10">
        <button className="text-sm font-bold text-foreground/50 hover:text-foreground hover:underline transition-all">
          Clear all filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-[140px] chrome-card rounded-3xl p-6 self-start max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide">
        <FilterContent />
      </aside>

      {/* Mobile Sticky Button */}
      <div className="md:hidden sticky top-[120px] z-40 w-full flex justify-center pb-4">
        <button 
          onClick={() => setIsOpenMobile(true)}
          className="chrome-card rounded-full px-6 py-2.5 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-bold"
        >
          <Filter size={16} />
          Filters (3)
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsOpenMobile(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-background chrome-card !rounded-t-3xl !rounded-b-none z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/10">
                <button onClick={() => setIsOpenMobile(false)} className="p-2 -ml-2 rounded-full hover:bg-surface">
                  <X size={20} />
                </button>
                <span className="font-syne font-bold">Filters</span>
                <button className="text-sm font-bold text-foreground/50 hover:text-foreground">Clear</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 pb-24">
                <FilterContent />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/10">
                <button className="liquid-button w-full py-4 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_var(--accent)]">
                  Show 24 items
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
