'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';
import { AvailabilityCalendar } from '@/components/pdp/AvailabilityCalendar'
import { useApiClient } from '@/lib/api-client';

export type ActiveTab = 'where' | 'when' | 'what' | null;

interface SearchBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedArea: LahoreArea | null;
  setSelectedArea: (a: LahoreArea | null) => void;
  whatSearch: string;
  setWhatSearch: (s: string) => void;
  selectedDates: { start: Date | null; end: Date | null };
  setSelectedDates: (d: { start: Date | null; end: Date | null }) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
    icon: string;
  };
  condition?: string;
}

// Shared panel style: heavy frosted glass with inner bevel + deep shadow
const panelStyle: React.CSSProperties = {
  background: 'rgba(10, 10, 14, 0.82)',
  backdropFilter: 'blur(40px) saturate(200%)',
  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow:
    '0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
};

export function SearchBar({ activeTab, setActiveTab, selectedArea, setSelectedArea, whatSearch, setWhatSearch, selectedDates, setSelectedDates }: SearchBarProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const whereInputRef = useRef<HTMLInputElement | null>(null);
  // FIX #1: ref for the "When" segment so we can programmatically focus it.
  // Previously nothing ever called .focus() on this div, so its onKeyDown
  // (which handles Enter/Escape) never fired because it never had focus.
  const whenSegmentRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (tab: ActiveTab) => {
    const isOpeningWhen = tab === 'when' && activeTab !== 'when';
    // If we are opening the WHEN panel and there's only a start selected (no end), clear it
    if (isOpeningWhen && selectedDates.start && !selectedDates.end) {
      setSelectedDates({ start: null, end: null });
    }
    setActiveTab(activeTab === tab ? null : tab);
  };

  // Navigate between sections: Where → When → What
  const advanceToNext = (currentTab: ActiveTab) => {
    if (currentTab === 'where') setActiveTab('when');
    else if (currentTab === 'when') setActiveTab('what');
    // 'what' Enter triggers runSearch (handled separately)
  };

  const api = useApiClient();
  const [areaSearch, setAreaSearch] = useState('');

  // Clear area search text when dropdown closes
  useEffect(() => {
    if (activeTab === null) {
      setAreaSearch('');
    }
  }, [activeTab]);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) {
      return POPULAR_AREA_IDS.map(id => getAreaById(id, LAHORE_AREAS_DATA)).filter(Boolean) as LahoreArea[];
    }
    return searchAreas(areaSearch, LAHORE_AREAS_DATA, 5);
  }, [areaSearch]);

  const handleSelectDates = (dates: { start: Date | null; end: Date | null }) => {
    setSelectedDates(dates);
    if (dates.start && dates.end) setActiveTab('what');
  }

  // WHAT tab search state is lifted to parent
  const whatInputRef = useRef<HTMLInputElement | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = () => {
    // Merge search-bar values onto the EXISTING URL params so that
    // category, sort, min_rate, max_rate, and delivery_available are
    // preserved when the user refines their search query.
    const params = new URLSearchParams(currentSearchParams.toString());

    const query = whatSearch.trim();
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    if (selectedArea) {
      params.set('area', selectedArea.id);
    } else {
      params.delete('area');
    }

    if (selectedDates.start && selectedDates.end) {
      params.set('start_date', format(selectedDates.start, 'yyyy-MM-dd'));
      params.set('end_date', format(selectedDates.end, 'yyyy-MM-dd'));
    } else {
      params.delete('start_date');
      params.delete('end_date');
    }

    params.set('view', 'results');
    router.push(`/?${params.toString()}`);
    setActiveTab(null);
  };

  // Fetch search results when whatSearch changes
  useEffect(() => {
    if (!whatSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get('listings', {
          searchParams: { q: whatSearch.trim(), limit: 8, sort: 'popular' },
          signal: controller.signal,
        }).json<{ data: SearchResult[] }>();
        setSearchResults(response.data || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [whatSearch, api]);

  // Ensure the correct input/segment has focus when a tab is opened
  useEffect(() => {
    if (activeTab === 'where') {
      const t = setTimeout(() => {
        try {
          whereInputRef.current?.focus();
        } catch {
          // ignore
        }
      }, 80);
      return () => clearTimeout(t);
    }
    if (activeTab === 'when') {
      // FIX #1 (continued): give the When segment div real keyboard focus
      // so its Enter/Escape handler actually fires, same as Where/What.
      const t = setTimeout(() => {
        try {
          whenSegmentRef.current?.focus();
        } catch {
          // ignore
        }
      }, 80);
      return () => clearTimeout(t);
    }
    if (activeTab === 'what') {
      // small timeout to wait for animation/DOM to settle
      const t = setTimeout(() => {
        try {
          whatInputRef.current?.focus();
          // place cursor at end
          const el = whatInputRef.current as HTMLInputElement | null;
          if (el) el.setSelectionRange(el.value.length, el.value.length);
        } catch {
          // ignore
        }
      }, 80);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

  return (
    <div className="relative w-full max-w-4xl z-50">
      {/* Background Dimmer when a tab is open */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/20 backdrop-blur-sm -z-10"
            onClick={() => setActiveTab(null)}
          />
        )}
      </AnimatePresence>

      {/* The Search Bar Container */}
      <div
        className={cn(
          "chrome-card rounded-full flex items-center transition-all duration-300 border border-border/20",
          activeTab ? "bg-background dark:bg-surface shadow-xl" : "bg-background/90 dark:bg-surface/50 shadow-md hover:shadow-lg"
        )}
      >
        {/* WHERE Segment */}
        <div
          onClick={() => handleTabClick('where')}
          className={cn(
            "flex-1 min-w-0 px-6 py-3.5 rounded-full cursor-pointer transition-all duration-300 relative group",
            activeTab === 'where' ? "bg-background shadow-none" : "hover:bg-border/5",
            activeTab && activeTab !== 'where' && "opacity-60"
          )}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">Where</div>
          <div className="h-5 flex items-center pr-6 relative w-full">
            {activeTab === 'where' ? (
              <>
                <input
                  ref={whereInputRef}
                  autoFocus
                  type="text"
                  value={areaSearch}
                  onChange={(e) => {
                    setAreaSearch(e.target.value);
                    setSelectedArea(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // FIX #2: if the user typed an area but never clicked a
                      // suggestion, don't silently drop it — adopt the top
                      // filtered match so it actually reaches runSearch().
                      // Empty input still advances freely (no query is allowed).
                      if (!selectedArea && areaSearch.trim() && filteredAreas.length > 0) {
                        setSelectedArea(filteredAreas[0]);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('stuflux_last_area_id', filteredAreas[0].id);
                        }
                      }
                      advanceToNext('where');
                    }
                    if (e.key === 'Escape') setActiveTab(null);
                  }}
                  placeholder="Search areas in Lahore"
                  className="bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none w-full min-w-0 pr-6"
                />
              </>
            ) : (
              <>
                <div className="text-sm text-foreground/60 w-full truncate">
                  {selectedArea ? selectedArea.name : (areaSearch || 'Search areas in Lahore')}
                </div>
              </>
            )}
            {activeTab === 'where' && (areaSearch || selectedArea) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAreaSearch('');
                  setSelectedArea(null);
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
              >
                <X size={10} className="text-foreground/70" />
              </button>
            )}
          </div>
          {activeTab !== 'where' && activeTab !== 'when' && !(areaSearch || selectedArea) && (
            <div className="absolute right-0 top-3 bottom-3 w-px bg-border/40 dark:bg-border/60 transition-opacity group-hover:opacity-0" />
          )}
        </div>

        {/* WHEN Segment */}
        <div
          ref={whenSegmentRef}
          onClick={() => handleTabClick('when')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              advanceToNext('when');
            }
            if (e.key === 'Escape') setActiveTab(null);
          }}
          tabIndex={0}
          className={cn(
            "flex-1 px-6 py-3.5 rounded-full cursor-pointer transition-all duration-300 relative group",
            activeTab === 'when' ? "bg-background shadow-md" : "hover:bg-border/5",
            activeTab && activeTab !== 'when' && "opacity-60"
          )}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">When</div>
          <div className="h-5 flex items-center pr-6 relative w-full">
            <div className="text-sm text-foreground/60 truncate w-full">
              {selectedDates.start && selectedDates.end
                ? `${format(selectedDates.start, 'MMM d')} - ${format(selectedDates.end, 'MMM d')}`
                : 'Add dates'}
            </div>
            {activeTab === 'when' && selectedDates.start && selectedDates.end && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDates({ start: null, end: null });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
              >
                <X size={10} className="text-foreground/70" />
              </button>
            )}
          </div>
          {activeTab !== 'when' && activeTab !== 'what' && !(selectedDates.start && selectedDates.end) && (
            <div className="absolute right-0 top-3 bottom-3 w-px bg-border/40 dark:bg-border/60 transition-opacity group-hover:opacity-0" />
          )}
        </div>

        {/* WHAT Segment */}
        <div
          onClick={() => handleTabClick('what')}
          className={cn(
            "flex-1 pl-6 pr-2 py-2 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-between group",
            activeTab === 'what' ? "bg-background shadow-md" : "hover:bg-border/5",
            activeTab && activeTab !== 'what' && "opacity-60"
          )}
        >
          <div className="flex-1 pr-4">
            <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">What</div>
            {activeTab === 'what' ? (
              <div className="h-5 flex items-center pr-6 relative w-full">
                <input
                  ref={whatInputRef}
                  autoFocus
                  type="text"
                  value={whatSearch}
                  onChange={(e) => setWhatSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') runSearch();
                    if (e.key === 'Escape') setActiveTab(null);
                  }}
                  placeholder="Search listings..."
                  className="bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none w-full min-w-0 pr-6"
                />
                {activeTab === 'what' && whatSearch.trim() && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setWhatSearch(''); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                  >
                    <X size={10} className="text-foreground/70" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-5 flex items-center relative w-full">
                <div className="text-sm text-foreground/60 truncate w-full">
                  {whatSearch || 'Cameras, tools, etc...'}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              runSearch();
            }}
            className="hyper-liquid h-12 w-12 !rounded-full flex items-center justify-center shrink-0"
          >
            <Search size={20} strokeWidth={3} className="relative z-10" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* WHERE panel */}
        {activeTab === 'where' && (
          <motion.div
            key="where"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute top-[80px] left-0 w-[90vw] max-w-sm rounded-3xl overflow-hidden shadow-2xl origin-top-left"
            style={panelStyle}
          >
            {/* Top subtle highlight line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-3 px-1">
                {areaSearch ? 'Search Results' : 'Popular Areas'}
              </p>
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto -mx-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
                {filteredAreas.length === 0 ? (
                  <div className="text-sm text-foreground/30 py-6 text-center">No areas found</div>
                ) : (
                  filteredAreas.map((area) => {
                    const isSelected = selectedArea?.id === area.id;
                    return (
                      <div
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('stuflux_last_area_id', area.id);
                          }
                          setActiveTab('when');
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-150"
                        style={isSelected ? {
                          background: 'rgba(0,255,255,0.08)',
                          border: '1px solid rgba(0,255,255,0.2)',
                          boxShadow: '0 0 12px rgba(0,255,255,0.06)',
                        } : { border: '1px solid transparent' }}
                        onMouseEnter={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = '';
                        }}
                      >
                        <div
                          className="w-8 h-8 flex items-center justify-center shrink-0 text-sm"
                        >
                          📍
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn(
                            "text-base font-semibold leading-tight truncate",
                            isSelected ? "text-accent" : "text-foreground"
                          )}>{area.name}</div>
                          <div className="text-[11px] text-foreground/30 mt-0.5">Lahore, Pakistan</div>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" style={{ boxShadow: '0 0 6px rgba(0,255,255,0.8)' }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* WHEN panel */}
        {activeTab === 'when' && (
          <motion.div
            key="when"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[90vw] max-w-[350px] rounded-3xl overflow-hidden shadow-2xl origin-top"
            style={panelStyle}
          >
            {/* Top subtle highlight line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-4">
              <div className="mb-2 text-center">
                <h3 className="font-display text-sm font-bold text-foreground">Select dates</h3>
                <p className="mt-0.5 text-[11px] text-foreground/45">Choose any range within the next 2 months</p>
              </div>
              <div className="mx-auto w-full">
                <AvailabilityCalendar
                  mode="renter"
                  blockedDates={[]}
                  selectedDates={selectedDates}
                  onSelectDates={handleSelectDates}
                  monthsToShow={1}
                  compact={true}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* WHAT panel */}
        {activeTab === 'what' && (
          <motion.div
            key="what"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute top-[80px] right-0 w-[90vw] max-w-sm rounded-3xl overflow-hidden shadow-2xl origin-top-right"
            style={panelStyle}
          >
            {/* Top subtle highlight line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-5">
              {/* Results only — input lives in the main search bar */}
              {/* Loading State */}
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-accent" />
                </div>
              )}
              {/* Search Results */}
              {!isSearching && whatSearch.trim() && (
                <div className="space-y-2 max-h-[320px] overflow-y-auto -mx-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
                  {searchResults.length === 0 ? (
                    <div className="text-sm text-foreground/30 py-6 text-center">No results found</div>
                  ) : (
                    searchResults.map((result) => {
                      const escapedQuery = whatSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const regex = new RegExp(`(${escapedQuery})`, 'gi');
                      const titleParts = result.title.split(regex);
                      const descSnippet = result.description.substring(0, 60) + (result.description.length > 60 ? '...' : '');
                      return (
                        <div
                          key={result.id}
                          className="px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                          style={{
                            border: '1px solid transparent',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                            (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,255,255,0.2)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = '';
                            (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                          }}
                          onClick={() => {
                            router.push(`/listings/${result.id}` as Route);
                            setActiveTab(null);
                          }}
                        >
                          {/* Title with highlighted search term */}
                          <div className="text-sm font-semibold text-foreground leading-tight mb-1">
                            {titleParts.map((part, i) => (
                              <span
                                key={i}
                                className={regex.test(part) ? 'text-accent bg-accent/20 px-0.5 rounded' : ''}
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                          {/* Description snippet */}
                          <div className="text-xs text-foreground/50 mb-2 line-clamp-2">{descSnippet}</div>
                          {/* Category & Condition */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(0,255,255,0.1)', color: 'rgba(0,255,255,0.8)' }}
                            >
                              {result.category?.icon} {result.category?.name}
                            </span>
                            {result.condition && (
                              <span className="text-[10px] text-foreground/40 px-2 py-0.5">
                                • {result.condition}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              {/* Empty state when no search query */}
              {!whatSearch.trim() && !isSearching && (
                <div className="text-center py-6">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-3">
                    Start typing to search
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Cameras', 'Tools', 'Drones'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setWhatSearch(tag)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,255,255,0.25)';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,255,0.05)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
