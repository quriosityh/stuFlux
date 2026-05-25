'use client';

import { cn } from '@/lib/utils';

interface ActivityTabsProps {
  activeTab: 'renting' | 'lending';
  onChange: (tab: 'renting' | 'lending') => void;
  rentingCount: number;
  lendingCount: number;
  pendingRequestsCount: number;
}

export default function ActivityTabs({
  activeTab,
  onChange,
  rentingCount,
  lendingCount,
  pendingRequestsCount,
}: ActivityTabsProps) {
  return (
    <div className="flex md:flex-col p-1.5 md:p-3 space-x-2 md:space-x-0 md:space-y-3 bg-white/[0.04] border border-white/10 rounded-full md:rounded-3xl shadow-2xl backdrop-blur-xl w-full">
      <button
        onClick={() => onChange('renting')}
        className={cn(
          'flex-1 flex items-center justify-between py-3 px-5 rounded-full md:rounded-xl font-medium transition-all duration-300 relative overflow-hidden',
          activeTab === 'renting' 
            ? 'bg-white/10 text-white font-bold border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
            : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
        )}
      >
        {activeTab === 'renting' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_var(--accent)] hidden md:block" />
        )}
        {activeTab === 'renting' && (
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-accent shadow-[0_0_10px_var(--accent)] md:hidden rounded-t-full" />
        )}
        <span className="flex items-center gap-2">
          <span className="text-lg">🛍️</span> Renting
        </span>
        {rentingCount > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
            {rentingCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onChange('lending')}
        className={cn(
          'flex-1 flex items-center justify-between py-3 px-5 rounded-full md:rounded-xl font-medium transition-all duration-300 relative overflow-hidden',
          activeTab === 'lending' 
            ? 'bg-white/10 text-white font-bold border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
            : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
        )}
      >
        {activeTab === 'lending' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_var(--accent)] hidden md:block" />
        )}
        {activeTab === 'lending' && (
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-accent shadow-[0_0_10px_var(--accent)] md:hidden rounded-t-full" />
        )}
        <span className="flex items-center gap-2">
          <span className="text-lg">💰</span> Lending
        </span>
        <div className="flex items-center gap-2">
          {pendingRequestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
          )}
          {lendingCount > 0 && pendingRequestsCount === 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
              {lendingCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
