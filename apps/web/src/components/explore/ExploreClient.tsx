'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { CategoryStrip } from './CategoryStrip';
import { DiscoveryFeed } from './DiscoveryFeed';
import { HowItWorks } from './HowItWorks';
import { LenderCTA } from './LenderCTA';
import { FilterSidebar } from './FilterSidebar';
import { ListingGrid } from './ListingGrid';
import { ResultsHeader } from './ResultsHeader';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || 'all';

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`${pathname}?${params.toString()}` as any, { scroll: false });
  };

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const isFiltering = search !== '' || category !== 'all';
  const mode = isFiltering ? 'search' : 'discovery';

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '24', sort: 'newest' });
      if (search) params.set('q', search);
      if (category && category !== 'all') params.set('category', category);
      const res = await apiClient
        .get(`listings?${params.toString()}`)
        .json<{ data: any[]; meta: { total: number } }>();
      setItems(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    if (mode === 'search') fetchListings();
  }, [mode, fetchListings]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <CategoryStrip activeCategory={category} onCategoryChange={setCategory} />

      <main className="w-[85%] mx-auto pt-10 pb-20">
        {mode === 'discovery' ? (
          <div className="space-y-10">
            <DiscoveryFeed />
            <HowItWorks />
            <LenderCTA />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 relative items-start">
            <FilterSidebar />
            <div className="flex-1 w-full min-w-0">
              <ResultsHeader count={total} />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />
                  ))}
                </div>
              ) : (
                <ListingGrid items={items} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExploreClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreContent />
    </Suspense>
  );
}
