'use client';

import { CategoryCarousel } from './CategoryCarousel';

export function DiscoveryFeed() {
  // Mock data for carousels
  const mockItems = Array.from({ length: 8 }).map((_, i) => ({ id: i }));

  return (
    <div className="space-y-8">
      <CategoryCarousel 
        title="📷 Cameras near you" 
        categorySlug="cameras" 
        items={mockItems} 
      />
      <CategoryCarousel 
        title="🔧 Tools & Equipment" 
        categorySlug="tools" 
        items={mockItems} 
      />
      <CategoryCarousel 
        title="🎸 Musical Instruments" 
        categorySlug="music" 
        items={mockItems} 
      />
      <CategoryCarousel 
        title="🚲 Rides & Vehicles" 
        categorySlug="vehicles" 
        items={mockItems} 
      />
    </div>
  );
}
