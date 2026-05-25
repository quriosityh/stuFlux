import { ActivityBooking } from './types';
import BookingCard from './BookingCard';
import BookingSection from './BookingSection';
import EmptyState from './EmptyState';
import { isFuture, isPast } from 'date-fns';

interface RentingTabProps {
  bookings: ActivityBooking[];
}

export default function RentingTab({ bookings }: RentingTabProps) {
  const today = new Date();
  
  // Categorize bookings
  const activeBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.start_date) <= today && 
    new Date(b.end_date) >= today
  );
  
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    isFuture(new Date(b.start_date))
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || 
    b.status === 'rejected' ||
    (b.status === 'confirmed' && isPast(new Date(b.end_date)))
  );

  // If literally no bookings ever
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="No rentals yet"
        description="You haven't rented anything yet. Browse our marketplace to find what you need."
        actionLabel="Browse Items"
        actionHref="/"
      />
    );
  }

  return (
    <div className="space-y-12">
      <BookingSection 
        title="Active Rentals" 
        icon="🟢" 
        count={activeBookings.length}
        isEmpty={activeBookings.length === 0}
      >
        {activeBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="renter" />
        ))}
      </BookingSection>

      <BookingSection 
        title="Upcoming" 
        icon="📅" 
        count={upcomingBookings.length}
        isEmpty={upcomingBookings.length === 0}
      >
        {upcomingBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} role="renter" />
        ))}
      </BookingSection>

      <BookingSection 
        title="Past Rentals" 
        icon="📦"
        isEmpty={pastBookings.length === 0}
      >
        {pastBookings.map(booking => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            role="renter" 
            actions={
              <button 
                disabled 
                title="Coming soon"
                className="glass-spotlight px-4 py-2 text-sm opacity-50 cursor-not-allowed"
              >
                Leave Review
              </button>
            }
          />
        ))}
      </BookingSection>
    </div>
  );
}
