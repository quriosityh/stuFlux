'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { CategoryCarousel } from './CategoryCarousel';

const CATEGORIES = [
  { title: '⚡ Power & Energy',          slug: 'power-energy' },
  { title: '🔧 Tools & Home Fix',        slug: 'tools-home-fix' },
  { title: '📷 Cameras & Creators',      slug: 'cameras-creators' },
  { title: '🎸 Music & Audio',           slug: 'music-audio' },
  { title: '👕 Clothing & Fashion',      slug: 'clothing-fashion' },
  { title: '🎉 Hosting & Party',         slug: 'hosting-party' },
  { title: '🚲 Bikes & Boards',          slug: 'bikes-boards' },
  { title: '⛺ Travel & Outdoors',       slug: 'travel-outdoors' },
];

// Seed-matching sample data with real picsum photos
const ALL_SAMPLE: any[] = [
  { id: 's1',  title: 'Honda EU22i Portable Generator', daily_rate: 2200, area: 'Gulberg',     condition: 'good',     delivery_available: true,  booking_count: 6,  category: { id: 1, slug: 'power-energy'     }, photos: [{ url: 'https://picsum.photos/seed/honda-eu22i-generator-1-1/800/600',   thumbnail_url: 'https://picsum.photos/seed/honda-eu22i-generator-1-1/400/300',   is_primary: true }] },
  { id: 's2',  title: 'Bosch Drill Set with Bits',      daily_rate: 650,  area: 'Johar Town',  condition: 'good',     delivery_available: false, booking_count: 11, category: { id: 2, slug: 'tools-home-fix'   }, photos: [{ url: 'https://picsum.photos/seed/bosch-drill-set-1-1/800/600',         thumbnail_url: 'https://picsum.photos/seed/bosch-drill-set-1-1/400/300',         is_primary: true }] },
  { id: 's3',  title: 'Canon EOS 200D DSLR Camera',    daily_rate: 2500, area: 'Gulberg',     condition: 'like_new', delivery_available: true,  booking_count: 8,  category: { id: 3, slug: 'cameras-creators'}, photos: [{ url: 'https://picsum.photos/seed/canon-eos-200d-1-1/800/600',           thumbnail_url: 'https://picsum.photos/seed/canon-eos-200d-1-1/400/300',           is_primary: true }] },
  { id: 's4',  title: 'Trek Mountain Bike',             daily_rate: 800,  area: 'Bahria Town', condition: 'fair',     delivery_available: false, booking_count: 12, category: { id: 7, slug: 'bikes-boards'     }, photos: [{ url: 'https://picsum.photos/seed/trek-mountain-bike-1-1/800/600',       thumbnail_url: 'https://picsum.photos/seed/trek-mountain-bike-1-1/400/300',       is_primary: true }] },
  { id: 's5',  title: 'Epson HD Projector',             daily_rate: 2000, area: 'Gulberg',     condition: 'good',     delivery_available: true,  booking_count: 9,  category: { id: 6, slug: 'hosting-party'   }, photos: [{ url: 'https://picsum.photos/seed/epson-projector-1-1/800/600',          thumbnail_url: 'https://picsum.photos/seed/epson-projector-1-1/400/300',          is_primary: true }] },
  { id: 's6',  title: 'Yamaha Acoustic Guitar',         daily_rate: 900,  area: 'DHA Phase 5', condition: 'good',     delivery_available: true,  booking_count: 2,  category: { id: 4, slug: 'music-audio'     }, photos: [{ url: 'https://picsum.photos/seed/yamaha-acoustic-guitar-1-1/800/600',   thumbnail_url: 'https://picsum.photos/seed/yamaha-acoustic-guitar-1-1/400/300',   is_primary: true }] },
  { id: 's7',  title: 'Navy Blue Sherwani',             daily_rate: 3000, area: 'Model Town',  condition: 'like_new', delivery_available: true,  booking_count: 4,  category: { id: 5, slug: 'clothing-fashion'}, photos: [{ url: 'https://picsum.photos/seed/navy-blue-sherwani-1-1/800/600',       thumbnail_url: 'https://picsum.photos/seed/navy-blue-sherwani-1-1/400/300',       is_primary: true }] },
  { id: 's8',  title: 'Four Person Camping Tent',       daily_rate: 1100, area: 'Johar Town',  condition: 'good',     delivery_available: true,  booking_count: 3,  category: { id: 8, slug: 'travel-outdoors' }, photos: [{ url: 'https://picsum.photos/seed/four-person-camping-tent-1-1/800/600', thumbnail_url: 'https://picsum.photos/seed/four-person-camping-tent-1-1/400/300', is_primary: true }] },
  { id: 's9',  title: 'Karcher Pressure Washer',        daily_rate: 1200, area: 'Model Town',  condition: 'good',     delivery_available: true,  booking_count: 5,  category: { id: 2, slug: 'tools-home-fix'  }, photos: [{ url: 'https://picsum.photos/seed/pressure-washer-1-1/800/600',          thumbnail_url: 'https://picsum.photos/seed/pressure-washer-1-1/400/300',          is_primary: true }] },
  { id: 's10', title: '1kW Solar Inverter Kit',         daily_rate: 1800, area: 'DHA Phase 5', condition: 'like_new', delivery_available: true,  booking_count: 3,  category: { id: 1, slug: 'power-energy'    }, photos: [{ url: 'https://picsum.photos/seed/solar-inverter-kit-1-1/800/600',       thumbnail_url: 'https://picsum.photos/seed/solar-inverter-kit-1-1/400/300',       is_primary: true }] },
  { id: 's11', title: 'JBL PartyBox 110 Speaker',       daily_rate: 1500, area: 'Johar Town',  condition: 'good',     delivery_available: true,  booking_count: 7,  category: { id: 4, slug: 'music-audio'    }, photos: [{ url: 'https://picsum.photos/seed/jbl-partybox-110-1-1/800/600',         thumbnail_url: 'https://picsum.photos/seed/jbl-partybox-110-1-1/400/300',         is_primary: true }] },
  { id: 's12', title: 'Neewer Ring Light with Stand',   daily_rate: 500,  area: 'Bahria Town', condition: 'like_new', delivery_available: false, booking_count: 4,  category: { id: 3, slug: 'cameras-creators'}, photos: [{ url: 'https://picsum.photos/seed/neewer-ring-light-1-1/800/600',        thumbnail_url: 'https://picsum.photos/seed/neewer-ring-light-1-1/400/300',        is_primary: true }] },
];

const BY_POPULAR  = [...ALL_SAMPLE].sort((a, b) => b.booking_count - a.booking_count);
const BY_NEWEST   = [...ALL_SAMPLE].reverse();

export function DiscoveryFeed() {
  const [trending,    setTrending]    = useState<any[]>([]);
  const [popular,     setPopular]     = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Trending (popular-sorted)
    apiClient.get('listings?sort=popular&limit=12&status=active').json<{ data: any[] }>()
      .then(res => setTrending(res.data?.length ? res.data : BY_POPULAR))
      .catch(() => setTrending(BY_POPULAR));

    // Most Popular (by booking_count)
    apiClient.get('listings?sort=popular&limit=12&status=active').json<{ data: any[] }>()
      .then(res => setPopular(res.data?.length ? res.data : BY_POPULAR))
      .catch(() => setPopular(BY_POPULAR));

    // New Arrivals
    apiClient.get('listings?sort=newest&limit=12&status=active').json<{ data: any[] }>()
      .then(res => setNewArrivals(res.data?.length ? res.data : BY_NEWEST))
      .catch(() => setNewArrivals(BY_NEWEST));

    // Per-category rows — filter sample by category slug
    CATEGORIES.forEach(async ({ slug }) => {
      try {
        const res = await apiClient.get(`listings?category=${slug}&sort=popular&limit=10`).json<{ data: any[] }>();
        const data = res.data?.length ? res.data : ALL_SAMPLE.filter(i => i.category.slug === slug);
        setCategoryData(prev => ({ ...prev, [slug]: data }));
      } catch {
        setCategoryData(prev => ({
          ...prev,
          [slug]: ALL_SAMPLE.filter(i => i.category.slug === slug),
        }));
      }
    });
  }, []);

  return (
    <div className="space-y-14">
      {/* 🔥 Trending — Always visible */}
      {trending.length > 0 && (
        <CategoryCarousel title="🔥 Trending" categorySlug="all" items={trending} />
      )}

      {/* ⭐ Most Popular */}
      {popular.length > 0 && (
        <CategoryCarousel title="⭐ Most Popular" categorySlug="all" items={popular} />
      )}

      {/* ✨ New Arrivals — Always visible */}
      {newArrivals.length > 0 && (
        <CategoryCarousel title="✨ New Arrivals" categorySlug="all" items={newArrivals} />
      )}

      {/* Per-Category Carousels */}
      {CATEGORIES.map(({ title, slug }) => {
        const items = categoryData[slug] ?? [];
        if (items.length === 0) return null;
        return (
          <CategoryCarousel key={slug} title={title} categorySlug={slug} items={items} />
        );
      })}
    </div>
  );
}
