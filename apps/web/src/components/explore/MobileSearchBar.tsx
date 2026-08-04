'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, MapPin, Calendar, Tag, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Route } from 'next';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';
import { AvailabilityCalendar } from '@/components/pdp/AvailabilityCalendar';
import { useApiClient } from '@/lib/api-client';

export type MobileActiveTab = 'where' | 'when' | 'what' | null;

interface MobileSearchResult {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
    icon: string;
  };
  condition?: string;
}

export function MobileSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApiClient();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileActiveTab>('where');

  const [selectedArea, setSelectedArea] = useState<LahoreArea | null>(null);
  const [areaSearch, setAreaSearch] = useState('');
  const [whatSearch, setWhatSearch] = useState('');
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [searchResults, setSearchResults] = useState<MobileSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const whereInputRef = useRef<HTMLInputElement | null>(null);
  const whatInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal search state with URL parameters on mount/URL change
  useEffect(() => {
    if (!isOpen) {
      const urlQ = searchParams.get('q') || '';
      const urlAreaId = searchParams.get('area') || '';
      const urlStartDate = searchParams.get('start_date') || '';
      const urlEndDate = searchParams.get('end_date') || '';

      setWhatSearch(urlQ);

      if (urlAreaId) {
        const area = getAreaById(urlAreaId, LAHORE_AREAS_DATA);
        setSelectedArea(area ? (area as LahoreArea) : null);
      } else {
        setSelectedArea(null);
      }

      if (urlStartDate && urlEndDate) {
        setSelectedDates({ start: new Date(urlStartDate), end: new Date(urlEndDate) });
      } else {
        setSelectedDates({ start: null, end: null });
      }
    }
  }, [isOpen, searchParams]);

  // Sync theme
  useEffect(() => {
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // Filter Lahore areas
  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) {
      return POPULAR_AREA_IDS.map((id) => getAreaById(id, LAHORE_AREAS_DATA)).filter(Boolean) as LahoreArea[];
    }
    return searchAreas(areaSearch, LAHORE_AREAS_DATA, 5);
  }, [areaSearch]);

  // Fetch search results when whatSearch changes inside the overlay
  useEffect(() => {
    if (!isOpen || !whatSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api
          .get('listings', {
            searchParams: { q: whatSearch.trim(), limit: 6, sort: 'popular' },
            signal: controller.signal,
          })
          .json<{ data: MobileSearchResult[] }>();
        setSearchResults(response.data || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Mobile search error:', error);
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
  }, [isOpen, whatSearch, api]);

  // Auto focus input when active tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'where') {
        setTimeout(() => whereInputRef.current?.focus(), 100);
      } else if (activeTab === 'what') {
        setTimeout(() => whatInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, activeTab]);

  // Run Search (navigates & updates URL params, allowing empty queries)
  const runSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

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
    router.push(`/?${params.toString()}` as Route);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setSelectedArea(null);
    setAreaSearch('');
    setSelectedDates({ start: null, end: null });
    setWhatSearch('');
  };

  const summaryText = useMemo(() => {
    const parts: string[] = [];
    if (selectedArea) parts.push(selectedArea.name);
    if (selectedDates.start && selectedDates.end) {
      parts.push(`${format(selectedDates.start, 'MMM d')} - ${format(selectedDates.end, 'MMM d')}`);
    }
    if (whatSearch.trim()) parts.push(whatSearch.trim());

    if (parts.length === 0) return 'Start your search';
    return parts.join(' • ');
  }, [selectedArea, selectedDates, whatSearch]);

  return (
    <>
      {/* 1. STICKY MOBILE TOP BAR WITH SEARCH PILL */}
      <div data-mobile-nav-header="true" className="md:hidden sticky top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/10 px-4 py-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="font-syne font-bold text-2xl tracking-tighter shrink-0 flex items-center">
            <span className="text-foreground">Stu</span>
            <span className="text-[var(--accent)]">Flux</span>
          </div>

          {/* Mobile Search Trigger Pill (spacious, right-aligned) */}
          <button
            onClick={() => {
              setIsOpen(true);
              setActiveTab('where');
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface/90 border border-border/20 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex-1 max-w-[320px] min-w-0 ml-auto"
          >
            <span className="text-xs font-semibold text-foreground/80 truncate  flex-1">
              {summaryText}
            </span>
            <Search size={16} className="text-[var(--accent)] shrink-0" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 2. FULL-SCREEN MOBILE SEARCH OVERLAY MODAL (matching mobilesearch2.png) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden"
          >
            {/* Modal Top Header (Close button & title) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/10 bg-surface/50">
              <h2 className="font-syne text-lg font-bold">Search StuFlux</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-border/20 border border-border/15 flex items-center justify-center transition-colors"
                aria-label="Close search"
              >
                <X size={16} className="text-foreground/80" />
              </button>
            </div>

            {/* Modal Body: Scrollable Accordion Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* CARD 1: WHERE */}
              <div
                className={cn(
                  'rounded-3xl border transition-all duration-200 overflow-hidden',
                  activeTab === 'where'
                    ? 'bg-surface border-border/30 shadow-lg p-5'
                    : 'bg-surface/50 border-border/10 p-4 cursor-pointer hover:bg-surface'
                )}
                onClick={() => {
                  if (activeTab !== 'where') setActiveTab('where');
                }}
              >
                {activeTab === 'where' ? (
                  <div className="space-y-4">
                    <h3 className="font-syne text-xl font-bold text-foreground">Where to?</h3>
                    <div className="relative flex items-center">
                      <MapPin size={18} className="absolute left-3.5 text-foreground/40" />
                      <input
                        ref={whereInputRef}
                        type="text"
                        value={areaSearch}
                        onChange={(e) => {
                          setAreaSearch(e.target.value);
                          setSelectedArea(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!selectedArea && areaSearch.trim() && filteredAreas.length > 0) {
                              setSelectedArea(filteredAreas[0]);
                            }
                            setActiveTab('when');
                          }
                        }}
                        placeholder="Search areas in Lahore..."
                        className="w-full pl-10 pr-9 py-3 rounded-2xl bg-background border border-border/20 text-sm font-medium focus:outline-none focus:border-[var(--accent)]"
                      />
                      {(areaSearch || selectedArea) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAreaSearch('');
                            setSelectedArea(null);
                          }}
                          className="absolute right-3 p-1 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground/70"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Area suggestions list */}
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {filteredAreas.length === 0 ? (
                        <p className="text-xs text-foreground/40 text-center py-4">No matching areas</p>
                      ) : (
                        filteredAreas.map((area) => {
                          const isSelected = selectedArea?.id === area.id;
                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => {
                                setSelectedArea(area);
                                setActiveTab('when');
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all text-sm font-medium',
                                isSelected
                                  ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]'
                                  : 'hover:bg-background/80 text-foreground/80'
                              )}
                            >
                              <span className="text-base">📍</span>
                              <div className="flex-1 truncate">
                                <div className="font-semibold leading-tight">{area.name}</div>
                                <div className="text-[10px] text-foreground/40">Lahore, Pakistan</div>
                              </div>
                              {isSelected && <span className="text-xs font-bold">Selected</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-foreground/50">Where</span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {selectedArea ? selectedArea.name : 'Anywhere in Lahore'}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 2: WHEN */}
              <div
                className={cn(
                  'rounded-3xl border transition-all duration-200 overflow-hidden',
                  activeTab === 'when'
                    ? 'bg-surface border-border/30 shadow-lg p-5'
                    : 'bg-surface/50 border-border/10 p-4 cursor-pointer hover:bg-surface'
                )}
                onClick={() => {
                  if (activeTab !== 'when') setActiveTab('when');
                }}
              >
                {activeTab === 'when' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-syne text-xl font-bold text-foreground">When's your rental?</h3>
                      {selectedDates.start && selectedDates.end && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDates({ start: null, end: null });
                          }}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline"
                        >
                          Reset dates
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <AvailabilityCalendar
                        mode="renter"
                        blockedDates={[]}
                        selectedDates={selectedDates}
                        onSelectDates={(dates) => {
                          setSelectedDates(dates);
                          if (dates.start && dates.end) {
                            setActiveTab('what');
                          }
                        }}
                        monthsToShow={1}
                        compact={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-foreground/50">When</span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {selectedDates.start && selectedDates.end
                        ? `${format(selectedDates.start, 'MMM d')} - ${format(selectedDates.end, 'MMM d')}`
                        : 'Add dates'}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 3: WHAT */}
              <div
                className={cn(
                  'rounded-3xl border transition-all duration-200 overflow-hidden',
                  activeTab === 'what'
                    ? 'bg-surface border-border/30 shadow-lg p-5'
                    : 'bg-surface/50 border-border/10 p-4 cursor-pointer hover:bg-surface'
                )}
                onClick={() => {
                  if (activeTab !== 'what') setActiveTab('what');
                }}
              >
                {activeTab === 'what' ? (
                  <div className="space-y-4">
                    <h3 className="font-syne text-xl font-bold text-foreground">What are you looking for?</h3>
                    <div className="relative flex items-center">
                      <Search size={18} className="absolute left-3.5 text-foreground/40" />
                      <input
                        ref={whatInputRef}
                        type="text"
                        value={whatSearch}
                        onChange={(e) => setWhatSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            runSearch();
                          }
                        }}
                        placeholder="Search cameras, generators, tools..."
                        className="w-full pl-10 pr-9 py-3 rounded-2xl bg-background border border-border/20 text-sm font-medium focus:outline-none focus:border-[var(--accent)]"
                      />
                      {whatSearch.trim() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWhatSearch('');
                          }}
                          className="absolute right-3 p-1 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground/70"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Quick Category / Item Tags */}
                    <div>
                      <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/40 mb-2">
                        Popular Suggestions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['DSLR Camera', 'Generator', 'Drill Set', 'Guitar', 'Sherwani', 'Camping Tent'].map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setWhatSearch(tag)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                                whatSearch === tag
                                  ? 'bg-[var(--accent)] text-black font-bold border-[var(--accent)]'
                                  : 'bg-background hover:bg-surface border-border/20 text-foreground/70'
                              )}
                            >
                              {tag}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Live search results preview */}
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader size={20} className="animate-spin text-[var(--accent)]" />
                      </div>
                    ) : (
                      searchResults.length > 0 && (
                        <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                          {searchResults.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                router.push(`/listings/${item.id}` as Route);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-background/80 transition-colors text-left"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="text-xs font-semibold text-foreground truncate">{item.title}</div>
                                <div className="text-[10px] text-foreground/40 truncate">{item.description}</div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] shrink-0 font-medium">
                                {item.category?.icon} {item.category?.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-foreground/50">What</span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {whatSearch || 'Search gear...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Sticky Footer Bar (matching mobilesearch2.png) */}
            <div className="border-t border-border/10 bg-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold underline text-foreground/70 hover:text-foreground transition-colors"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={runSearch}
                className="hyper-liquid flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-black shadow-lg hover:shadow-xl transition-all"
              >
                <Search size={16} strokeWidth={3} />
                <span>Search</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
