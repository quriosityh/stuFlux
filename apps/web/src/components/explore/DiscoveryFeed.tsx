'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { CategoryCarousel } from './CategoryCarousel';

const SECTIONS = [
  { title: '📷 Cameras & Lenses', slug: 'cameras', categoryId: 1 },
  { title: '🔧 Tools & Equipment', slug: 'tools', categoryId: 2 },
  { title: '🎸 Musical Instruments', slug: 'music', categoryId: 3 },
  { title: '🚲 Rides & Vehicles', slug: 'vehicles', categoryId: 4 },
];

export function DiscoveryFeed() {
  const [sectionData, setSectionData] = useState<Record<string, any[]>>({});

  const SAMPLE_ITEMS = [
    { id: 'sample-1', title: 'Bosch Power Drill', daily_rate: 800, area: 'LAH-001', category: { id: 2, slug: 'tools-home-fix' } },
    { id: 'sample-2', title: 'Canon DSLR Kit', daily_rate: 2500, area: 'LAH-012', category: { id: 3, slug: 'cameras-creators' } },
    { id: 'sample-3', title: 'Acoustic Guitar', daily_rate: 600, area: 'LAH-005', category: { id: 3, slug: 'music-audio' } },
  ];

  useEffect(() => {
    // Fetch listings for each section in parallel; fall back to sample items on error/empty
    SECTIONS.forEach(async ({ slug, categoryId }) => {
      try {
        const res = await apiClient
          .get(`listings?category_id=${categoryId}&limit=8&sort=popular`)
          .json<{ data: any[] }>();
        const data = res.data && res.data.length ? res.data : SAMPLE_ITEMS.filter((_, i) => i < 4);
        setSectionData(prev => ({ ...prev, [slug]: data }));
      } catch {
        setSectionData(prev => ({ ...prev, [slug]: SAMPLE_ITEMS.filter((_, i) => i < 4) }));
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      {SECTIONS.map(({ title, slug }) => (
        <CategoryCarousel
          key={slug}
          title={title}
          categorySlug={slug}
          items={sectionData[slug] ?? []}
        />
      ))}
    </div>
  );
}
