'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getAreaById, getNearbyAreas, LAHORE_AREAS_DATA } from '@stuflux/types';
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



function DiscoverySkeleton() {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 animate-pulse">
      {Array.from({ length: 2 }).map((_, r) => (
        <div key={r} className="space-y-5">
          <div className="h-8 w-48 rounded-xl bg-surface" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[calc(20%-13px)] space-y-3">
                <div className="aspect-[4/3] rounded-2xl bg-surface" />
                <div className="h-4 w-3/4 rounded-lg bg-surface" />
                <div className="h-3 w-1/2 rounded-lg bg-surface" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LazyCategoryRow({ title, slug }: { title: string; slug: string }) {
  const [inView, setInView] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!inView) return;

    apiClient
      .get(`listings?category=${slug}&sort=popular&limit=10&status=active`)
      .json<{ data: any[] }>()
      .then((res) => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [inView, slug]);

  return (
    <div ref={setRef} className="min-h-[220px] sm:min-h-[260px]">
      {loading ? (
        <div className="space-y-5 animate-pulse pt-2">
          <div className="h-8 w-48 rounded-xl bg-surface" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[calc(20%-13px)] space-y-3">
                <div className="aspect-[4/3] rounded-2xl bg-surface" />
                <div className="h-4 w-3/4 rounded-lg bg-surface" />
                <div className="h-3 w-1/2 rounded-lg bg-surface" />
              </div>
            ))}
          </div>
        </div>
      ) : items.length > 0 ? (
        <CategoryCarousel title={title} categorySlug={slug} items={items} />
      ) : null}
    </div>
  );
}

export function DiscoveryFeed() {
  const { isSignedIn } = useAuth();
  const [nearbyItems, setNearbyItems] = useState<any[]>([]);
  const [nearbyTitle, setNearbyTitle] = useState('');
  const [nearbyAnchor, setNearbyAnchor] = useState('');

  const [trending,    setTrending]    = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Request 1: Popular listings (Trending row)
    const fetchPopular = apiClient
      .get('listings?sort=popular&limit=12&status=active')
      .json<{ data: any[] }>()
      .then((res) => {
        setTrending(res.data || []);
      })
      .catch(() => {
        setTrending([]);
      });

    // ── Request 2: New Arrivals
    const fetchNewest = apiClient
      .get('listings?sort=newest&limit=12&status=active')
      .json<{ data: any[] }>()
      .then((res) => setNewArrivals(res.data || []))
      .catch(() => setNewArrivals([]));

    // ── Request 3: Nearby Items
    const fetchNearby = async () => {
      let anchorAreaId = '';
      if (typeof window !== 'undefined') {
        anchorAreaId = localStorage.getItem('stuflux_last_area_id') || '';
      }

      if (!anchorAreaId && isSignedIn) {
        try {
          const meRes = await apiClient.get('users/me').json<{ data: { area?: string } }>();
          if (meRes.data?.area) {
            anchorAreaId = meRes.data.area;
          }
        } catch (e) {
          // ignore
        }
      }

      if (!anchorAreaId) return;

      const anchorArea = getAreaById(anchorAreaId, LAHORE_AREAS_DATA);
      if (!anchorArea) return;

      setNearbyTitle(`${anchorArea.name} & Nearby`);
      setNearbyAnchor(anchorAreaId);

      const neighbours = getNearbyAreas(anchorAreaId, LAHORE_AREAS_DATA, 3);
      const areaIds = [anchorAreaId, ...neighbours.map(n => n.id)];

      try {
        const requests = areaIds.map(id => 
          apiClient.get(`listings?area=${id}&sort=popular&limit=12&status=active`).json<{ data: any[] }>()
        );
        const results = await Promise.allSettled(requests);
        
        const allListings: any[] = [];
        const seen = new Set();
        for (const res of results) {
          if (res.status === 'fulfilled' && res.value.data) {
            for (const item of res.value.data) {
              if (!seen.has(item.id)) {
                seen.add(item.id);
                allListings.push(item);
              }
            }
          }
        }
        
        setNearbyItems(allListings.slice(0, 12));
      } catch (e) {
        // ignore
      }
    };

    Promise.allSettled([fetchPopular, fetchNewest, fetchNearby()]).then(() => {
      setLoading(false);
    });
  }, [isSignedIn]);

  if (loading) {
    return <DiscoverySkeleton />;
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* 📍 Area & Nearby (Conditional) */}
      {nearbyItems.length > 0 && (
        <CategoryCarousel 
          title={nearbyTitle} 
          categorySlug="all" 
          href={`/?view=results&area=${nearbyAnchor}`} 
          items={nearbyItems} 
        />
      )}

      {/* 🔥 Trending */}
      {trending.length > 0 && (
        <CategoryCarousel title="🔥 Trending" categorySlug="all" href="/?view=results" items={trending} />
      )}

      {/* ✨ New Arrivals */}
      {newArrivals.length > 0 && (
        <CategoryCarousel title="✨ New Arrivals" categorySlug="all" href="/?view=results&sort=newest" items={newArrivals} />
      )}

      {/* Lazy-Loaded Per-Category Carousels */}
      {CATEGORIES.map(({ title, slug }) => (
        <LazyCategoryRow key={slug} title={title} slug={slug} />
      ))}
    </div>
  );
}
