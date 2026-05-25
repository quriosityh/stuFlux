import { useState } from 'react';
import { ActivityBooking } from './types';
import BookingCard from './BookingCard';
import BookingSection from './BookingSection';
import EarningsSummary from './EarningsSummary';
import EmptyState from './EmptyState';
import { useApiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface LendingTabProps {
  bookings: ActivityBooking[];
  onBookingUpdated: () => void;
}

export default function LendingTab({ bookings, onBookingUpdated }: LendingTabProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const api = useApiClient();
  
  const today = new Date();
  
  // Categorize bookings
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  
  const activeRentals = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.start_date) <= today && 
    new Date(b.end_date) >= today
  );

  const handleAction = async (id: string, action: 'confirm' | 'reject') => {
    try {
      setProcessingId(id);
      await api.patch(`bookings/${id}/${action}`);
      alert(`Booking request ${action === 'confirm' ? 'accepted' : 'declined'}!`);
      onBookingUpdated(); // refresh data
    } catch (error) {
      alert(`Failed to ${action} booking request. Please try again.`);
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  // If literally no bookings ever
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="💸"
        title="Start earning today"
        description="You don't have any lending activity yet. List your unused items to start earning cash."
        actionLabel="List an Item"
        actionHref="/listings/new"
      />
    );
  }

  return (
    <div className="space-y-12">
      {/* Earnings Summary is always at top if there's history */}
      <EarningsSummary bookings={bookings} />

      <BookingSection 
        title="Incoming Requests" 
        icon="🔔" 
        count={pendingRequests.length}
        hasNotification={pendingRequests.length > 0}
        isEmpty={pendingRequests.length === 0}
      >
        {pendingRequests.map(booking => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            role="owner"
            actions={
              <div className="flex gap-2 bg-white/5 rounded-lg p-2 border border-white/10 shadow-lg">
                <button 
                  onClick={() => handleAction(booking.id, 'reject')}
                  disabled={processingId === booking.id}
                  className="glass-spotlight px-4 py-2 text-sm hover:text-rose-500 hover:border-rose-500/50 disabled:opacity-50 transition-colors"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleAction(booking.id, 'confirm')}
                  disabled={processingId === booking.id}
                  className="liquid-button px-6 py-2 text-sm min-w-[100px] text-black font-extrabold tracking-wide border border-emerald-500/50 shadow-[0_0_10px_rgba(0,255,0,0.6)]"
                >
                  {processingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    'Accept'
                  )}
                </button>
              </div>
            }
          />
        ))}
      </BookingSection>

      <BookingSection 
        title="Active Rentals Out" 
        icon="🟢" 
        count={activeRentals.length}
        isEmpty={activeRentals.length === 0}
      >
        {activeRentals.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="owner" />
        ))}
      </BookingSection>
    </div>
  );
}
