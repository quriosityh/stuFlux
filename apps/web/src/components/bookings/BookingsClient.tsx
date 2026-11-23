'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import RentingTab from './RentingTab';
import RentingOutTab from './RentingOutTab';

type Tab = 'renting' | 'rentingOut';

export default function BookingsClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => (
    searchParams.get('tab') === 'rentingOut' ? 'rentingOut' : 'renting'
  ));

  return (
    <div className="flex flex-col gap-6">
      {/* Sleek Segmented Control */}
      <div className="relative flex p-1 bg-muted/50 rounded-xl max-w-sm w-full mx-auto sm:mx-0 backdrop-blur-sm border border-border/40">
        {(['renting', 'rentingOut'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative w-1/2 flex items-center justify-center py-2.5 text-[15px] font-medium transition-colors z-10 ${
              activeTab === tab ? 'text-foreground' : 'text-foreground/60 hover:text-foreground/80'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">
              {tab === 'renting' ? 'Renting' : 'Renting Out'}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content with Animation */}
      <div className="relative mt-2 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {activeTab === 'renting' ? <RentingTab /> : <RentingOutTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
