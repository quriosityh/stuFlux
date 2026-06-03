import { useState } from 'react';
import { ActivityBooking } from './types';
import BookingCard from './BookingCard';
import BookingSection from './BookingSection';
import EarningsSummary from './EarningsSummary';
import EmptyState from './EmptyState';
import { useApiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import { IconCheck, IconX, IconMessage, IconDeviceLaptop } from '@tabler/icons-react';

interface LendingTabProps {
  bookings: ActivityBooking[];
  onBookingUpdated: () => void;
  onLocalAction: (id: string, action: 'confirm' | 'reject') => void;
}

export default function LendingTab({ bookings, onBookingUpdated, onLocalAction }: LendingTabProps) {
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

  const upcomingLendings = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.start_date) > today
  );

  const handleAction = async (id: string, action: 'confirm' | 'reject') => {
    try {
      setProcessingId(id);
      await api.patch(`bookings/${id}/${action}`);
      onLocalAction(id, action);
      alert(`Booking request ${action === 'confirm' ? 'accepted' : 'declined'}!`);
      onBookingUpdated(); // refresh data
    } catch (error) {
      onLocalAction(id, action);
      alert(`Booking request simulated: ${action === 'confirm' ? 'accepted' : 'declined'}`);
      onBookingUpdated();
    } finally {
      setProcessingId(null);
    }
  };

  // If literally no bookings ever (meaning completely empty lender history)
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<IconDeviceLaptop className="w-12 h-12" stroke={1} />}
        title="Start earning today"
        description="You don't have any lending activity yet. List your unused items to start earning cash."
        actionLabel="List an Item"
        actionHref="/listings/new"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Earnings Summary is always at top if there's history */}
      <EarningsSummary bookings={bookings} />

      {/* Incoming Requests */}
      <BookingSection 
        title="Incoming Requests" 
        count={pendingRequests.length}
        hasNotification={pendingRequests.length > 0}
        isEmpty={pendingRequests.length === 0}
        emptyMessage="No pending incoming requests."
        indicator="amber-dot"
      >
        {pendingRequests.map(booking => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            role="owner"
            showMessage={true}
            footer={
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 flex-1">
                  <button 
                    onClick={() => handleAction(booking.id, 'reject')}
                    disabled={processingId === booking.id}
                    className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-rose-500/25 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    <IconX className="w-3.5 h-3.5" stroke={1.5} />
                    Decline
                  </button>
                  <button 
                    onClick={() => handleAction(booking.id, 'confirm')}
                    disabled={processingId === booking.id}
                    className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 active:scale-95 transition-all min-w-[80px] justify-center"
                  >
                    {processingId === booking.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <IconCheck className="w-3.5 h-3.5" stroke={1.5} />
                        Accept
                      </>
                    )}
                  </button>
                </div>
                <button className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-border/80 bg-surface/60 text-foreground/80 hover:text-foreground hover:bg-foreground/5 active:scale-95 transition-all">
                  <IconMessage className="w-3.5 h-3.5" stroke={1.5} />
                  Message
                </button>
              </div>
            }
          />
        ))}
      </BookingSection>

      {/* Active Rentals Out */}
      <BookingSection 
        title="Active Rentals Out" 
        count={activeRentals.length}
        isEmpty={activeRentals.length === 0}
        emptyMessage="No active items lent out right now."
        indicator="green-dot"
      >
        {activeRentals.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="owner" />
        ))}
      </BookingSection>

      {/* Upcoming Lendings */}
      <BookingSection 
        title="Upcoming Lendings" 
        count={upcomingLendings.length}
        isEmpty={upcomingLendings.length === 0}
        emptyMessage="No upcoming lending sessions scheduled."
        indicator="blue-dot"
      >
        {upcomingLendings.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="owner" />
        ))}
      </BookingSection>
    </div>
  );
}
