'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { CategoryCarousel } from './CategoryCarousel';

const CATEGORIES = [
  { title: '⚡ Power & Energy', slug: 'power-energy' },
  { title: '🔧 Tools & Home Fix', slug: 'tools-home-fix' },
  { title: '📷 Cameras & Creators', slug: 'cameras-creators' },
  { title: '🎸 Music & Audio', slug: 'music-audio' },
  { title: '👕 Clothing & Fashion', slug: 'clothing-fashion' },
  { title: '🎉 Hosting & Party Essentials', slug: 'hosting-party' },
  { title: '🚲 Bikes & Boards', slug: 'bikes-boards' },
  { title: '⛺ Travel & Outdoors', slug: 'travel-outdoors' },
];

export function DiscoveryFeed() {
  const [trending, setTrending] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});

  const SAMPLE_ITEMS = [
    { id: 'sample-1', title: 'Bosch Power Drill', daily_rate: 800, area: 'Gulberg', category: { id: 2, slug: 'tools-home-fix' } },
    { id: 'sample-2', title: 'Canon DSLR Kit', daily_rate: 2500, area: 'DHA', category: { id: 3, slug: 'cameras-creators' } },
    { id: 'sample-3', title: 'Acoustic Guitar', daily_rate: 600, area: 'Johar Town', category: { id: 3, slug: 'music-audio' } },
    { id: 'sample-4', title: 'Portable Generator 3KVA', daily_rate: 1500, area: 'Model Town', category: { id: 1, slug: 'power-energy' } },
  ];

  useEffect(() => {
    // Fetch Trending
    apiClient
      .get('listings?sort=popular&limit=12&status=active')
      .json<{ data: any[] }>()
      .then(res => setTrending(res.data && res.data.length ? res.data : SAMPLE_ITEMS))
      .catch(() => setTrending(SAMPLE_ITEMS));

    // Fetch New Arrivals
    apiClient
      .get('listings?sort=newest&limit=12&status=active')
      .json<{ data: any[] }>()
      .then(res => setNewArrivals(res.data && res.data.length ? res.data : [...SAMPLE_ITEMS].reverse()))
      .catch(() => setNewArrivals([...SAMPLE_ITEMS].reverse()));

    // Fetch Categories
    CATEGORIES.forEach(async ({ slug }) => {
      try {
        const res = await apiClient
          .get(`listings?category_id=${slug}&sort=popular&limit=10`)
          .json<{ data: any[] }>();
        const data = res.data && res.data.length ? res.data : SAMPLE_ITEMS;
        setCategoryData(prev => ({ ...prev, [slug]: data }));
      } catch {
        setCategoryData(prev => ({ ...prev, [slug]: SAMPLE_ITEMS }));
      }
    });
  }, []);

  return (
    <div className="space-y-12">
      {/* Trending - Always visible, but hide if absolutely empty to avoid broken UI */}
      {trending.length > 0 && (
        <CategoryCarousel
          title="🔥 Trending"
          categorySlug="all" // Or whatever slug works for popular
          items={trending}
        />
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <CategoryCarousel
          title="✨ New Arrivals"
          categorySlug="all"
          items={newArrivals}
        />
      )}

      {/* Categories */}
      {CATEGORIES.map(({ title, slug }) => {
        const items = categoryData[slug] ?? [];
        // Categories with fewer than 3 listings hide their carousel row entirely.
        if (items.length < 3) return null;
        
        return (
          <CategoryCarousel
            key={slug}
            title={title}
            categorySlug={slug}
            items={items}
          />
        );
      })}
    </div>
  );
}
