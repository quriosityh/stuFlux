'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { ActivityBooking } from './types';
import RentingTab from './RentingTab';
import LendingTab from './LendingTab';

const MOCK_RENTING: ActivityBooking[] = [
  {
    id: '1',
    listing_id: 'l1',
    renter_id: 'me',
    owner_id: 'u1',
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_days: 5,
    total_amount: 15000,
    status: 'confirmed',
    message: null,
    created_at: new Date().toISOString(),
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
    start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
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
    start_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    end_date: new Date(Date.now() - 86400000 * 8).toISOString(),
    total_days: 2,
    total_amount: 6000,
    status: 'completed',
    message: null,
    created_at: new Date().toISOString(),
    listing: { title: 'DJI Mavic Air 2 Drone', daily_rate: 3000, city: 'Karachi' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Usman', avatar_url: null },
  },
];

const MOCK_LENDING: ActivityBooking[] = [
  {
    id: '4',
    listing_id: 'l4',
    renter_id: 'u4',
    owner_id: 'me',
    start_date: new Date(Date.now() + 86400000 * 1).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_days: 2,
    total_amount: 8000,
    status: 'pending',
    message: "Hi, I need this for a weekend project. Will take good care of it!",
    created_at: new Date().toISOString(),
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
    start_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    total_days: 3,
    total_amount: 4500,
    status: 'confirmed',
    message: null,
    created_at: new Date().toISOString(),
    listing: { title: 'Nintendo Switch OLED', daily_rate: 1500, city: 'Lahore' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1610444319307-5fa965fcc96d?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Sara', avatar_url: null },
    owner: { display_name: 'Me', avatar_url: null },
  },
];

export default function ActivityClient() {
  const [activeTab, setActiveTab] = useState<'renting' | 'lending'>('renting');
  const [rentingBookings, setRentingBookings] = useState<ActivityBooking[]>([]);
  const [lendingBookings, setLendingBookings] = useState<ActivityBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setRentingBookings(MOCK_RENTING);
      setLendingBookings(MOCK_LENDING);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => { fetchBookings(); }, []);

  const pendingCount = lendingBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Horizontal pill tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 bg-surface/5 backdrop-blur-[20px] border border-border/8 rounded-full w-fit">
        <TabPill
          label="Renting"
          count={rentingBookings.length}
          active={activeTab === 'renting'}
          onClick={() => setActiveTab('renting')}
        />
        <TabPill
          label="Lending"
          count={lendingBookings.length}
          badge={pendingCount}
          active={activeTab === 'lending'}
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
            <RentingTab bookings={rentingBookings} />
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
  count,
  badge,
  active,
  onClick,
}: {
  label: string;
  count: number;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] transition-colors ${
        active
          ? 'bg-foreground text-background font-medium'
          : 'bg-transparent text-foreground/50 hover:text-foreground font-normal'
      }`}
    >
      {label}
      <span
        className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
          active ? 'bg-background/20 text-background' : 'bg-foreground/10 text-foreground/50'
        }`}
      >
        {count}
      </span>
      {badge && badge > 0 ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-medium text-white flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
