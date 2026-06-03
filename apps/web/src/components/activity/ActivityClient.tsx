'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Package } from 'lucide-react';
import type { ActivityBooking } from './types';
import RentingTab from './RentingTab';
import LendingTab from './LendingTab';
import { useApiClient } from '@/lib/api-client';

const INITIAL_RENTING: ActivityBooking[] = [
  {
    id: '1',
    listing_id: 'l1',
    renter_id: 'me',
    owner_id: 'u1',
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(), // Active
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_days: 5,
    total_amount: 15000,
    status: 'confirmed',
    message: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    listing: { title: 'Sony Alpha A7III Camera Body', daily_rate: 3000, city: 'Lahore' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Ali Khan', avatar_url: null },
  },
  {
    id: '2',
    listing_id: 'l2',
    renter_id: 'me',
    owner_id: 'u2',
    start_date: new Date(Date.now() + 86400000 * 5).toISOString(), // Upcoming
    end_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    total_days: 2,
    total_amount: 4000,
    status: 'confirmed',
    message: null,
    created_at: new Date().toISOString(),
    listing: { title: 'Camping Tent 4-Person', daily_rate: 2000, city: 'Islamabad' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1504280390467-333065a8813a?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Zahra', avatar_url: null },
  },
  {
    id: '3',
    listing_id: 'l3',
    renter_id: 'me',
    owner_id: 'u3',
    start_date: new Date(Date.now() - 86400000 * 10).toISOString(), // Completed
    end_date: new Date(Date.now() - 86400000 * 8).toISOString(),
    total_days: 2,
    total_amount: 6000,
    status: 'completed',
    message: null,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    listing: { title: 'DJI Mavic Air 2 Drone', daily_rate: 3000, city: 'Karachi' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Usman', avatar_url: null },
  },
  {
    id: '6',
    listing_id: 'l6',
    renter_id: 'me',
    owner_id: 'u6',
    start_date: new Date(Date.now() + 86400000 * 3).toISOString(), // Pending request from renter
    end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    total_days: 2,
    total_amount: 5000,
    status: 'pending',
    message: 'Can I rent this for my school project?',
    created_at: new Date().toISOString(),
    listing: { title: 'Sony FE 50mm f/1.8 Lens', daily_rate: 2500, city: 'Lahore' },
    listing_photo: null,
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Kashif', avatar_url: null },
  }
];

const INITIAL_LENDING: ActivityBooking[] = [
  {
    id: '4',
    listing_id: 'l4',
    renter_id: 'u4',
    owner_id: 'me',
    start_date: new Date(Date.now() + 86400000 * 1).toISOString(), // Pending request
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_days: 2,
    total_amount: 8000,
    status: 'pending',
    message: 'Hi, I need this for a weekend project. Will take good care of it!',
    created_at: new Date(Date.now() - 86400000 * 0.2).toISOString(), // created ~4.8h ago
    listing: { title: 'MacBook Pro M2 (2023)', daily_rate: 4000, city: 'Lahore' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Bilal', avatar_url: null },
    owner: { display_name: 'Me', avatar_url: null },
  },
  {
    id: '5',
    listing_id: 'l5',
    renter_id: 'u5',
    owner_id: 'me',
    start_date: new Date(Date.now() - 86400000 * 1).toISOString(), // Active
    end_date: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day remaining
    total_days: 2,
    total_amount: 3000,
    status: 'confirmed',
    message: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    listing: { title: 'Nintendo Switch OLED', daily_rate: 1500, city: 'Lahore' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1610444319307-5fa965fcc96d?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Sara', avatar_url: null },
    owner: { display_name: 'Me', avatar_url: null },
  },
  {
    id: '7',
    listing_id: 'l1',
    renter_id: 'u1',
    owner_id: 'me',
    start_date: new Date(Date.now() - 86400000 * 60).toISOString(), // Completed
    end_date: new Date(Date.now() - 86400000 * 55).toISOString(),
    total_days: 5,
    total_amount: 15000,
    status: 'completed',
    message: null,
    created_at: new Date(Date.now() - 86400000 * 62).toISOString(),
    listing: { title: 'Sony Alpha A7III Camera Body', daily_rate: 3000, city: 'Lahore' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Ali Khan', avatar_url: null },
    owner: { display_name: 'Me', avatar_url: null },
  },
  {
    id: '8',
    listing_id: 'l3',
    renter_id: 'u3',
    owner_id: 'me',
    start_date: new Date(Date.now() - 86400000 * 30).toISOString(), // Completed
    end_date: new Date(Date.now() - 86400000 * 27).toISOString(),
    total_days: 3,
    total_amount: 9000,
    status: 'completed',
    message: null,
    created_at: new Date(Date.now() - 86400000 * 32).toISOString(),
    listing: { title: 'DJI Mavic Air 2 Drone', daily_rate: 3000, city: 'Karachi' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Usman', avatar_url: null },
    owner: { display_name: 'Me', avatar_url: null },
  }
];

// Session-level mutable copy of mock data
let mockRentingStore = [...INITIAL_RENTING];
let mockLendingStore = [...INITIAL_LENDING];

export default function ActivityClient() {
  const [activeTab, setActiveTab] = useState<'renting' | 'lending'>('renting');
  const [rentingBookings, setRentingBookings] = useState<ActivityBooking[]>([]);
  const [lendingBookings, setLendingBookings] = useState<ActivityBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to fetch from real API first
      const rentingRes = await api.get('bookings?role=renter').json<{ data: ActivityBooking[] }>();
      const lendingRes = await api.get('bookings?role=owner').json<{ data: ActivityBooking[] }>();
      
      // If we got empty arrays from API but we want mock data for testing/demo when DB is empty:
      if (rentingRes.data.length === 0 && lendingRes.data.length === 0) {
        setRentingBookings(mockRentingStore);
        setLendingBookings(mockLendingStore);
      } else {
        setRentingBookings(rentingRes.data);
        setLendingBookings(lendingRes.data);
      }
    } catch (e) {
      console.warn('API error, falling back to mock data:', e);
      // Fallback to session mock store
      setRentingBookings(mockRentingStore);
      setLendingBookings(mockLendingStore);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = (id: string, action: 'confirm' | 'reject') => {
    // Update local store to support immediate visual update in mock mode
    mockLendingStore = mockLendingStore.map(b => 
      b.id === id ? { ...b, status: action === 'confirm' ? 'confirmed' : 'rejected' } : b
    );
    mockRentingStore = mockRentingStore.map(b => 
      b.id === id ? { ...b, status: action === 'confirm' ? 'confirmed' : 'rejected' } : b
    );
    fetchBookings();
  };

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
            <RentingTab bookings={rentingBookings} onBookingUpdated={fetchBookings} onLocalAction={handleBookingAction} />
          ) : (
            <LendingTab bookings={lendingBookings} onBookingUpdated={fetchBookings} onLocalAction={handleBookingAction} />
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
      className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 flex-1 overflow-hidden group border ${
        active
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
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active 
          ? 'bg-white/20 text-white shadow-inner' 
          : 'bg-foreground/8 text-foreground/60 group-hover:bg-foreground/12'
      }`}>
        {icon}
      </div>

      {/* Label + sublabel */}
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-bold leading-tight ${
          active ? 'text-white' : 'text-foreground/85'
        }`}>
          {label}
        </div>
        <div className={`text-[11px] mt-0.5 font-medium ${
          active ? 'text-white/70' : 'text-foreground/45'
        }`}>
          {sublabel}
        </div>
      </div>

      {/* Count badge */}
      <div className={`shrink-0 flex flex-col items-end gap-1`}>
        <span className={`text-[18px] font-extrabold leading-none font-display ${
          active ? 'text-white' : 'text-foreground/70'
        }`}>
          {count}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${
          active ? 'text-white/60' : 'text-foreground/35'
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

