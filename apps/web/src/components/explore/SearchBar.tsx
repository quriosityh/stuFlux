'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';

export type ActiveTab = 'where' | 'when' | 'what' | null;

interface SearchBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
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

export function SearchBar({ activeTab, setActiveTab }: SearchBarProps) {
  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const [areaSearch, setAreaSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<LahoreArea | null>(null);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) {
      return POPULAR_AREA_IDS.map(id => getAreaById(id, LAHORE_AREAS_DATA)).filter(Boolean) as LahoreArea[];
    }
    return searchAreas(areaSearch, LAHORE_AREAS_DATA, 5);
  }, [areaSearch]);

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
            activeTab === 'where' ? "bg-background shadow-md" : "hover:bg-border/5",
            activeTab && activeTab !== 'where' && "opacity-60"
          )}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">Where</div>
          <div className="h-5 flex items-center pr-6 relative w-full">
            {activeTab === 'where' ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={areaSearch}
                  onChange={(e) => {
                    setAreaSearch(e.target.value);
                    setSelectedArea(null);
                  }}
                  placeholder="Search areas in Lahore"
                  className="bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none w-full min-w-0 pr-6"
                />
                {areaSearch && (
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
              </>
            ) : (
              <div className="text-sm text-foreground/60 w-full truncate">
                {selectedArea ? selectedArea.name : (areaSearch || 'Search areas in Lahore')}
              </div>
            )}
          </div>
          {activeTab !== 'where' && activeTab !== 'when' && (
            <div className="absolute right-0 top-3 bottom-3 w-px bg-border/40 dark:bg-border/60 transition-opacity group-hover:opacity-0" />
          )}
        </div>

        {/* WHEN Segment */}
        <div
          onClick={() => handleTabClick('when')}
          className={cn(
            "flex-1 px-6 py-3.5 rounded-full cursor-pointer transition-all duration-300 relative group",
            activeTab === 'when' ? "bg-background shadow-md" : "hover:bg-border/5",
            activeTab && activeTab !== 'when' && "opacity-60"
          )}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">When</div>
          <div className="text-sm text-foreground/60 truncate">Add dates</div>
          {activeTab !== 'when' && activeTab !== 'what' && (
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
            <div className="text-sm text-foreground/60 truncate">Cameras, tools, etc...</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(null);
            }}
            className="hyper-liquid h-12 w-12 rounded-full flex items-center justify-center shrink-0"
          >
            <Search size={20} strokeWidth={3} className="relative z-10" />
          </button>
        </div>
      </div>

      {/* DROPDOWN PANELS */}
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
            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[95vw] max-w-[500px] rounded-3xl overflow-hidden shadow-2xl origin-top"
            style={panelStyle}
          >
            {/* Top subtle highlight line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-6">
              <div
                className="flex items-center justify-center gap-1 p-1 rounded-full w-max mx-auto mb-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button
                  className="px-6 py-2 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.09)', boxShadow: '0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
                >Dates</button>
                <button className="px-6 py-2 rounded-full text-foreground/40 hover:text-foreground text-sm font-bold transition-colors">
                  Flexible
                </button>
              </div>
              <div
                className="h-56 flex flex-col items-center justify-center rounded-2xl"
                style={{ border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
              >
                <Calendar size={32} className="text-foreground/15 mb-3" />
                <p className="text-sm text-foreground/25 font-medium">Calendar Picker (V2)</p>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['Exact dates', '± 1 day', '± 2 days', '± 1 week'].map(opt => (
                  <button
                    key={opt}
                    className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:text-accent hover:border-accent/30"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                  >{opt}</button>
                ))}
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
              <p className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-4">Quick Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Cameras', 'Camping Gear', 'Power Tools', 'Drones', 'Bicycles', 'Projectors'].map(tag => (
                  <button
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 hover:text-accent"
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
                    <Camera size={13} className="opacity-40" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
