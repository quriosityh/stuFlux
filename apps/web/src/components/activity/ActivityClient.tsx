'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/lib/api-client';
import ActivityTabs from './ActivityTabs';
import RentingTab from './RentingTab';
import LendingTab from './LendingTab';
import type { ActivityBooking, BookingsResponse } from './types';
import { Loader2 } from 'lucide-react';

const MOCK_RENTING: ActivityBooking[] = [
  {
    id: '1',
    listing_id: 'l1',
    renter_id: 'me',
    owner_id: 'u1',
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(), // started 2 days ago
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // ends in 3 days
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
    start_date: new Date(Date.now() + 86400000 * 5).toISOString(), // starts in 5 days
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
    end_date: new Date(Date.now() - 86400000 * 8).toISOString(), // completed
    total_days: 2,
    total_amount: 6000,
    status: 'completed',
    message: null,
    created_at: new Date().toISOString(),
    listing: { title: 'DJI Mavic Air 2 Drone', daily_rate: 3000, city: 'Karachi' },
    listing_photo: { url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=500' },
    renter: { display_name: 'Me', avatar_url: null },
    owner: { display_name: 'Usman', avatar_url: null },
  }
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
  }
];

export default function ActivityClient() {
  const [activeTab, setActiveTab] = useState<'renting' | 'lending'>('renting');
  
  const [rentingBookings, setRentingBookings] = useState<ActivityBooking[]>([]);
  const [lendingBookings, setLendingBookings] = useState<ActivityBooking[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  const fetchBookings = async () => {
    // USING STATIC DUMMY DATA FOR UI PREVIEW
    setIsLoading(true);
    setTimeout(() => {
      setRentingBookings(MOCK_RENTING);
      setLendingBookings(MOCK_LENDING);
      setIsLoading(false);
    }, 500); // simulate short network delay
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Compute unread/pending request count for Lending tab
  const pendingRequestsCount = lendingBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Left Sidebar (Sticky on Desktop) */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-32 space-y-6">
        <ActivityTabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          rentingCount={rentingBookings.length}
          lendingCount={lendingBookings.length}
          pendingRequestsCount={pendingRequestsCount}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {error ? (
          <div className="bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchBookings} className="liquid-button">Try Again</button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'renting' ? (
              <RentingTab bookings={rentingBookings} />
            ) : (
              <LendingTab 
                bookings={lendingBookings} 
                onBookingUpdated={fetchBookings} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
