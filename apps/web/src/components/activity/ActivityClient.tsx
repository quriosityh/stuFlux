'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ShoppingBag, Package } from 'lucide-react';
import type { ActivityBooking } from './types';
import RentingTab from './RentingTab';
import LendingTab from './LendingTab';
import { useApiClient } from '@/lib/api-client';

export default function ActivityClient() {
  const [activeTab, setActiveTab] = useState<'renting' | 'lending'>('renting');
  const [rentingBookings, setRentingBookings] = useState<ActivityBooking[]>([]);
  const [lendingBookings, setLendingBookings] = useState<ActivityBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rentingRes = await api.get('bookings?role=renter').json<{ data: ActivityBooking[] }>();
      const lendingRes = await api.get('bookings?role=owner').json<{ data: ActivityBooking[] }>();
      setRentingBookings(rentingRes.data ?? []);
      setLendingBookings(lendingRes.data ?? []);
    } catch (e) {
      setError('Could not load your booking activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingCount = lendingBookings.filter(b => b.status === 'pending').length;

  const pendingRentingCount = rentingBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Premium Segmented Tab Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <TabPill
          label="Renting"
          sublabel="Aapki apni bookings"
          countLabel="Bookings"
          icon={<ShoppingBag size={16} strokeWidth={2} />}
          count={rentingBookings.length}
          badge={pendingRentingCount}
          active={activeTab === 'renting'}
          activeGradient="from-indigo-500 via-violet-500 to-purple-600"
          glowColor="rgba(99,102,241,0.35)"
          onClick={() => setActiveTab('renting')}
        />
        <TabPill
          label="Lending"
          sublabel="Doosron ki incoming requests"
          countLabel="Requests"
          icon={<Package size={16} strokeWidth={2} />}
          count={lendingBookings.length}
          badge={pendingCount}
          active={activeTab === 'lending'}
          activeGradient="from-emerald-500 via-teal-500 to-cyan-600"
          glowColor="rgba(16,185,129,0.35)"
          onClick={() => setActiveTab('lending')}
        />
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
        </div>
      ) : (
        <div>
          {activeTab === 'renting' ? (
            <RentingTab bookings={rentingBookings} onBookingUpdated={fetchBookings} />
          ) : (
            <LendingTab bookings={lendingBookings} onBookingUpdated={fetchBookings} />
          )}
        </div>
      )}
    </div>
  );
}

function TabPill({
  label,
  sublabel,
  countLabel,
  icon,
  count,
  badge,
  active,
  activeGradient,
  glowColor,
  onClick,
}: {
  label: string;
  sublabel: string;
  countLabel: string;
  icon: React.ReactNode;
  count: number;
  badge?: number;
  active: boolean;
  activeGradient: string;
  glowColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 flex-1 overflow-hidden group border ${active
          ? `bg-gradient-to-br ${activeGradient} text-white border-transparent shadow-lg`
          : 'bg-surface/40 backdrop-blur-sm border-border/40 text-foreground/70 hover:border-border hover:bg-surface/60'
        }`}
      style={active ? { boxShadow: `0 8px 32px ${glowColor}, 0 2px 8px rgba(0,0,0,0.15)` } : {}}
    >
      {/* Sheen overlay on active */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />
      )}

      {/* Icon bubble */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${active
          ? 'bg-white/20 text-white shadow-inner'
          : 'bg-foreground/8 text-foreground/60 group-hover:bg-foreground/12'
        }`}>
        {icon}
      </div>

      {/* Label + sublabel */}
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-bold leading-tight ${active ? 'text-white' : 'text-foreground/85'
          }`}>
          {label}
        </div>
        <div className={`text-[11px] mt-0.5 font-medium ${active ? 'text-white/70' : 'text-foreground/45'
          }`}>
          {sublabel}
        </div>
      </div>

      {/* Count badge */}
      <div className={`shrink-0 flex flex-col items-end gap-1`}>
        <span className={`text-[18px] font-extrabold leading-none font-display ${active ? 'text-white' : 'text-foreground/70'
          }`}>
          {count}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'text-white/60' : 'text-foreground/35'
          }`}>
          {countLabel}
        </span>
      </div>

      {/* Pending notification dot */}
      {badge && badge > 0 ? (
        <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-[10px] font-extrabold text-black flex items-center justify-center shadow-md">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
