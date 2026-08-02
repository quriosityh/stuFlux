'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { CategoryStrip, CATEGORIES_LIST, CategoryItem } from './CategoryStrip';
import { DiscoveryFeed } from './DiscoveryFeed';
import { HowItWorks } from './HowItWorks';
import { LenderCTA } from './LenderCTA';
import { FilterSidebar, ListingSort } from './FilterSidebar';
import { ListingGrid } from './ListingGrid';

// Fallback sample data matching backend schema for local offline fallback
const ALL_SAMPLE_FALLBACK: any[] = [
  { id: 's1',  title: 'Honda EU22i Portable Generator', daily_rate: 2200, area: 'Gulberg',     condition: 'good',     delivery_available: true,  booking_count: 6,  category: { id: 1, slug: 'power-energy'     }, photos: [{ url: 'https://picsum.photos/seed/honda-eu22i-generator-1-1/800/600',   thumbnail_url: 'https://picsum.photos/seed/honda-eu22i-generator-1-1/400/300',   is_primary: true }] },
  { id: 's2',  title: 'Bosch Drill Set with Bits',      daily_rate: 650,  area: 'Johar Town',  condition: 'good',     delivery_available: false, booking_count: 11, category: { id: 2, slug: 'tools-home-fix'   }, photos: [{ url: 'https://picsum.photos/seed/bosch-drill-set-1-1/800/600',         thumbnail_url: 'https://picsum.photos/seed/bosch-drill-set-1-1/400/300',         is_primary: true }] },
  { id: 's3',  title: 'Canon EOS 200D DSLR Camera',    daily_rate: 2500, area: 'Gulberg',     condition: 'like_new', delivery_available: true,  booking_count: 8,  category: { id: 3, slug: 'cameras-creators'}, photos: [{ url: 'https://picsum.photos/seed/canon-eos-200d-1-1/800/600',           thumbnail_url: 'https://picsum.photos/seed/canon-eos-200d-1-1/400/300',           is_primary: true }] },
  { id: 's4',  title: 'Trek Mountain Bike',             daily_rate: 800,  area: 'Bahria Town', condition: 'fair',     delivery_available: false, booking_count: 12, category: { id: 7, slug: 'bikes-boards'     }, photos: [{ url: 'https://picsum.photos/seed/trek-mountain-bike-1-1/800/600',       thumbnail_url: 'https://picsum.photos/seed/trek-mountain-bike-1-1/400/300',       is_primary: true }] },
  { id: 's5',  title: 'Epson HD Projector',             daily_rate: 2000, area: 'Gulberg',     condition: 'good',     delivery_available: true,  booking_count: 9,  category: { id: 6, slug: 'hosting-party'   }, photos: [{ url: 'https://picsum.photos/seed/epson-projector-1-1/800/600',          thumbnail_url: 'https://picsum.photos/seed/epson-projector-1-1/400/300',          is_primary: true }] },
  { id: 's6',  title: 'Yamaha Acoustic Guitar',         daily_rate: 900,  area: 'DHA Phase 5', condition: 'good',     delivery_available: true,  booking_count: 2,  category: { id: 4, slug: 'music-audio'     }, photos: [{ url: 'https://picsum.photos/seed/yamaha-acoustic-guitar-1-1/800/600',   thumbnail_url: 'https://picsum.photos/seed/yamaha-acoustic-guitar-1-1/400/300',   is_primary: true }] },
  { id: 's7',  title: 'Navy Blue Sherwani',             daily_rate: 3000, area: 'Model Town',  condition: 'like_new', delivery_available: true,  booking_count: 4,  category: { id: 5, slug: 'clothing-fashion'}, photos: [{ url: 'https://picsum.photos/seed/navy-blue-sherwani-1-1/800/600',       thumbnail_url: 'https://picsum.photos/seed/navy-blue-sherwani-1-1/400/300',       is_primary: true }] },
  { id: 's8',  title: 'Four Person Camping Tent',       daily_rate: 1100, area: 'Johar Town',  condition: 'good',     delivery_available: true,  booking_count: 3,  category: { id: 8, slug: 'travel-outdoors' }, photos: [{ url: 'https://picsum.photos/seed/four-person-camping-tent-1-1/800/600', thumbnail_url: 'https://picsum.photos/seed/four-person-camping-tent-1-1/400/300', is_primary: true }] },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL search params
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const view = searchParams.get('view') || '';
  const requestedSort = searchParams.get('sort');
  const sort: ListingSort =
    requestedSort === 'rate_asc' ||
    requestedSort === 'rate_desc' ||
    requestedSort === 'newest' ||
    requestedSort === 'rating_desc'
      ? requestedSort
      : 'popular'; // Default sort is popular (Trending)

  const minRateParam = searchParams.get('min_rate') || '';
  const maxRateParam = searchParams.get('max_rate') || '';
  const minRatePKR = minRateParam ? (Number(minRateParam) > 100000 ? String(Number(minRateParam) / 100) : minRateParam) : '';
  const maxRatePKR = maxRateParam ? (Number(maxRateParam) > 100000 ? String(Number(maxRateParam) / 100) : maxRateParam) : '';
  const deliveryOnly = searchParams.get('delivery_available') === 'true';

  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const area = searchParams.get('area') || '';

  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Active Category Meta lookup
  const isCategorySelected = category !== 'all';
  const activeCategoryMeta: CategoryItem | undefined = CATEGORIES_LIST.find((c) => c.id === category);

  // Compute active filter count across the 3 core filter groups
  const isSortActive = sort !== 'popular';
  const isPriceActive = Boolean(minRatePKR || maxRatePKR);
  const isDeliveryActive = deliveryOnly;

  const activeFilterCount = (isSortActive ? 1 : 0) + (isPriceActive ? 1 : 0) + (isDeliveryActive ? 1 : 0);

  // Check if Search & Results Mode is activated
  const isFiltering =
    Boolean(search) ||
    isCategorySelected ||
    isSortActive ||
    isPriceActive ||
    isDeliveryActive ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(area);

  const mode = isFiltering || view === 'results' ? 'search' : 'discovery';

  // Helper to update URL search parameters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '' || val === 'all' || (key === 'sort' && val === 'popular')) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.push(`${pathname}?${params.toString()}` as any, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setCategory = (cat: string) => {
    updateUrlParams({ category: cat });
  };

  const setSort = (nextSort: ListingSort) => {
    updateUrlParams({ sort: nextSort });
  };

  const applyPriceRange = (min: string, max: string) => {
    updateUrlParams({
      min_rate: min ? String(Number(min) * 100) : null,
      max_rate: max ? String(Number(max) * 100) : null,
    });
  };

  const toggleDelivery = (enabled: boolean) => {
    updateUrlParams({ delivery_available: enabled ? 'true' : null });
  };

  const handleClearAll = () => {
    router.push(pathname as any, { scroll: false });
  };

  // Fetch listings from API with parameters
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '24', sort });
      if (search) params.set('q', search);
      if (category && category !== 'all') params.set('category', category);
      if (area) params.set('area', area);
      if (minRatePKR) params.set('min_rate', (Number(minRatePKR) * 100).toString());
      if (maxRatePKR) params.set('max_rate', (Number(maxRatePKR) * 100).toString());
      if (deliveryOnly) params.set('delivery_available', 'true');
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);

      const res = await apiClient
        .get('listings?' + params.toString())
        .json<{ data: any[]; meta: { total: number } }>();

      setItems(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      console.warn('API error fetching listings, falling back to demo data', err);
      // Fallback local filtering
      let filtered = [...ALL_SAMPLE_FALLBACK];
      if (category && category !== 'all') {
        filtered = filtered.filter((item) => item.category.slug === category);
      }
      if (deliveryOnly) {
        filtered = filtered.filter((item) => item.delivery_available);
      }
      if (minRatePKR) {
        filtered = filtered.filter((item) => item.daily_rate >= Number(minRatePKR));
      }
      if (maxRatePKR) {
        filtered = filtered.filter((item) => item.daily_rate <= Number(maxRatePKR));
      }
      if (sort === 'rate_asc') {
        filtered.sort((a, b) => a.daily_rate - b.daily_rate);
      } else if (sort === 'rate_desc') {
        filtered.sort((a, b) => b.daily_rate - a.daily_rate);
      } else if (sort === 'newest') {
        filtered.reverse();
      }
      setItems(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, area, minRatePKR, maxRatePKR, deliveryOnly, startDate, endDate]);

  useEffect(() => {
    if (mode === 'search') {
      fetchListings();
    }
  }, [mode, fetchListings]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Category Strip is hidden when a category is selected */}
      {!isCategorySelected && (
        <CategoryStrip activeCategory={category} onCategoryChange={setCategory} />
      )}

      <main className="w-[92%] sm:w-[90%] md:w-[86%] max-w-[1600px] mx-auto pt-1 sm:pt-2 md:pt-3 pb-12 sm:pb-14">
        {mode === 'discovery' ? (
          <div className="space-y-10 sm:space-y-12">
            <DiscoveryFeed />
            <HowItWorks />
            <LenderCTA />
          </div>
        ) : (
          <div className="w-full">
            {/* Top Section: Category Header (Spans cleanly at top) */}
            {activeCategoryMeta && (
              <div className="mb-8">
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="flex items-center gap-2 text-xs font-semibold">
                    <li>
                      <Link
                        href="/"
                        className="text-foreground/55 transition-colors hover:text-[var(--accent)]"
                      >
                        Explore
                      </Link>
                    </li>
                    <li aria-hidden="true" className="text-foreground/30">&gt;</li>
                    <li aria-current="page" className="truncate text-foreground/75">
                      {activeCategoryMeta.label}
                    </li>
                  </ol>
                </nav>

                <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left md:ml-40 md:mr-0">
                  {/* Round Category Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-border/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeCategoryMeta.image}
                      alt={activeCategoryMeta.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title, Icon & Description */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                      <span className="text-xl sm:text-2xl">{activeCategoryMeta.icon}</span>
                      <h1 className="font-syne text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {activeCategoryMeta.label}
                      </h1>
                      <span className="text-xs sm:text-sm font-semibold text-foreground/60 bg-surface px-3 py-1 rounded-full border border-border/15">
                        {total === 1 ? '1 item' : `${total} items`}
                      </span>
                    </div>
                    <p className="mx-auto max-w-3xl text-sm leading-relaxed text-foreground/65 sm:mx-0 sm:text-base">
                      {activeCategoryMeta.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2-Column Layout starting exactly where listing cards begin */}
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative items-start">
              {/* Left Column: Filter Sidebar with Vertical Divider */}
              <FilterSidebar
                sort={sort}
                onSortChange={setSort}
                minRate={minRatePKR}
                maxRate={maxRatePKR}
                onApplyPrice={applyPriceRange}
                deliveryOnly={deliveryOnly}
                onToggleDelivery={toggleDelivery}
                activeFilterCount={activeFilterCount}
                onClearAll={handleClearAll}
                isOpenMobile={isOpenMobile}
                setIsOpenMobile={setIsOpenMobile}
                totalResults={total}
              />

              {/* Right Column: Listing Grid */}
              <div className="flex-1 w-full min-w-0">
                {!activeCategoryMeta && (
                  /* Compact Results Bar for general search (when no category selected) */
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                        Results
                      </span>
                      <span className="text-xs font-bold text-foreground/80 bg-surface px-3 py-1 rounded-full border border-border/10">
                        {total}
                      </span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-[var(--accent)] hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}

                {/* Listing Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <ListingGrid items={items} />
                )}
              </div>
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
