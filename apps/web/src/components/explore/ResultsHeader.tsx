'use client';

import { ChevronDown } from 'lucide-react';

interface ResultsHeaderProps {
  count: number;
}

export function ResultsHeader({ count }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
      <span className="text-sm font-medium text-foreground/80">
        {count > 0 ? `${count} items found` : 'No items found'}
      </span>
      
      <div className="relative group">
        <button className="flex items-center gap-2 chrome-card px-4 py-2 rounded-full text-sm font-semibold hover:border-border/30 transition-colors">
          Sort: Newest
          <ChevronDown size={16} className="text-foreground/50" />
        </button>
        
        {/* Dropdown (Simplified) */}
        <div className="absolute right-0 top-full mt-2 w-48 chrome-card rounded-2xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          {['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating'].map((opt) => (
            <button key={opt} className="w-full text-left px-4 py-2 rounded-xl hover:bg-surface text-sm font-medium transition-colors">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
