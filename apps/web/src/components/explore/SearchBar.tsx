'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActiveTab = 'where' | 'when' | 'what' | null;

interface SearchBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function SearchBar({ activeTab, setActiveTab }: SearchBarProps) {
  // Close dropdowns when clicking outside (simplified for now, ideally use a ref + click outside hook)
  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

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
          "chrome-card rounded-full flex items-center transition-all duration-300",
          activeTab ? "bg-surface shadow-lg" : "bg-surface/50 shadow-sm border-border/10"
        )}
      >
        {/* WHERE Segment */}
        <div 
          onClick={() => handleTabClick('where')}
          className={cn(
            "flex-1 px-6 py-3.5 rounded-full cursor-pointer transition-all duration-300 relative group",
            activeTab === 'where' ? "bg-background shadow-md" : "hover:bg-border/5",
            activeTab && activeTab !== 'where' && "opacity-60"
          )}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-foreground/80 mb-0.5">Where</div>
          <div className="text-sm text-foreground/60 truncate">Search areas in Lahore</div>
          
          {/* Right Border Divider */}
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
          
          {/* Right Border Divider */}
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
          
          {/* Search Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(null);
              // In the future, this is where we push to a /search route or fetch results
            }}
            className="hyper-liquid h-12 w-12 rounded-full flex items-center justify-center shrink-0"
          >
            <Search size={20} strokeWidth={3} className="relative z-10" />
          </button>
        </div>
      </div>

      {/* DROPDOWN PANELS */}
      <AnimatePresence>
        {activeTab === 'where' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="absolute top-[80px] left-0 w-[90vw] max-w-sm chrome-card rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/60 mb-4">Suggested Areas</h3>
            <div className="space-y-1">
              {[
                { icon: MapPin, title: 'Nearby', desc: 'Find gear around you' },
                { icon: MapPin, title: 'Johar Town / LUMS', desc: 'Near LUMS campus' },
                { icon: MapPin, title: 'Grand Trunk Road / UET', desc: 'Near UET main campus' },
                { icon: MapPin, title: 'Gulberg / Liberty', desc: 'Central Lahore hub' },
                { icon: MapPin, title: 'DHA / Cantt', desc: 'Defence & Cantt area' },
              ].map((area, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-border/5 flex items-center justify-center shrink-0">
                    <area.icon size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-syne">{area.title}</div>
                    <div className="text-xs text-foreground/60">{area.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'when' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[95vw] max-w-[500px] chrome-card rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-2 bg-surface/50 p-1 rounded-full w-max mx-auto mb-6">
              <button className="px-6 py-2 rounded-full bg-background shadow-sm text-sm font-bold">Dates</button>
              <button className="px-6 py-2 rounded-full text-foreground/70 hover:text-foreground text-sm font-bold transition-colors">Flexible</button>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/20 rounded-2xl">
               <Calendar size={32} className="text-foreground/20 mb-4" />
               <p className="text-sm text-foreground/50 font-medium">Calendar Picker (V2)</p>
            </div>
            
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['Exact dates', '± 1 day', '± 2 days', '± 1 week'].map(opt => (
                <button key={opt} className="px-4 py-2 rounded-full border border-border/10 text-xs font-semibold whitespace-nowrap hover:border-[var(--accent)] transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'what' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="absolute top-[80px] right-0 w-[90vw] max-w-sm chrome-card rounded-3xl p-6 shadow-2xl"
          >
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/60 mb-4">Quick Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Cameras', 'Camping Gear', 'Power Tools', 'Drones', 'Bicycles', 'Projectors'].map(tag => (
                <button key={tag} className="px-4 py-2 rounded-full bg-surface hover:bg-border/10 text-sm font-medium transition-colors flex items-center gap-2">
                  <Camera size={14} className="text-foreground/50" />
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
