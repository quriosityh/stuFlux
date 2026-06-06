'use client';

import { useState } from 'react';
import { CategoryStrip } from './CategoryStrip';
import { DiscoveryFeed } from './DiscoveryFeed';
import { HowItWorks } from './HowItWorks';
import { LenderCTA } from './LenderCTA';
import { FilterSidebar } from './FilterSidebar';
import { ListingGrid } from './ListingGrid';
import { ResultsHeader } from './ResultsHeader';

export default function ExploreClient() {
  // Global filter state for Explore Page
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('all');
  const [dates, setDates] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sort, setSort] = useState('newest');

  // Derived state: are we in search mode or discovery mode?
  const isFiltering = search !== '' || city !== '' || category !== 'all' || dates.start !== null || priceRange.min > 0;
  const mode = isFiltering ? 'search' : 'discovery';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 2. Category Strip */}
      <CategoryStrip />

      {/* Main Content Area */}
      <main className="w-[85%] mx-auto pt-10 pb-20">
        {mode === 'discovery' ? (
          <div className="space-y-10">
            {/* 3a. Discovery Mode */}
            <DiscoveryFeed />
            
            {/* 4a. How It Works */}
            <HowItWorks />

            {/* 5a. Lender CTA */}
            <LenderCTA />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 relative items-start">
            {/* 3b. Search Results Mode */}
            
            {/* Filter Sidebar (Desktop) */}
            <FilterSidebar />

            {/* Results Grid */}
            <div className="flex-1 w-full min-w-0">
              <ResultsHeader count={24} />
              <ListingGrid items={Array.from({ length: 12 }).map((_, i) => ({ id: i }))} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
