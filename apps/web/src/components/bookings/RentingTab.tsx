'use client';

import React, { useState } from 'react';
import { useBookings, type Booking } from '@/hooks/useBookings';
import { differenceInDays, format } from 'date-fns';
import { MessageCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import BookingDetailSheet from './BookingDetailSheet';
import ReviewModal from './ReviewModal';

export default function RentingTab() {
  const router = useRouter();
  const { bookings, isLoading, error, cancelBooking, refetch } = useBookings('renter');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        <p className="text-sm text-muted-foreground">Loading your rentals...</p>
      </div>
    );
  }

  if (error) {
    return <BookingsLoadError message={error.message} onRetry={refetch} />;
  }

  // Review eligibility must not depend solely on the API having already
  // transitioned an elapsed confirmed booking to `completed`.
  const canReview = (booking: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !booking.hasReviewed && (
      booking.phase === 'completed' ||
      (booking.phase === 'confirmed' && booking.endDate < today)
    );
  };

  const pendingRequests = bookings.filter(b => b.phase === 'pending').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const activeRentals = bookings.filter(b => b.phase === 'active').sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const upcomingRentals = bookings.filter(b => b.phase === 'confirmed' && !canReview(b)).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const completedRentals = bookings.filter(b => b.phase === 'completed' || (b.phase === 'confirmed' && b.endDate < new Date())).sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
  const reviewsNeeded = completedRentals.filter(canReview).length;

  const hasActiveRentals = pendingRequests.length > 0 || activeRentals.length > 0 || upcomingRentals.length > 0 || completedRentals.length > 0;

  if (bookings.length === 0 || !hasActiveRentals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border border-dashed border-border/60 rounded-3xl bg-card/20">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Calendar className="text-muted-foreground" size={24} />
        </div>
        <h3 className="font-semibold text-lg">No active rentals</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          Explore items available for rent in your university campus and place your first request.
        </p>
        <button
          onClick={() => router.push('/')}
          className="hyper-liquid px-5 py-2.5 rounded-xl font-semibold text-[14px]"
        >
          Browse Listings
        </button>
      </div>
    );
  }

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to cancel this booking request?')) {
      await cancelBooking(id);
    }
  };

  const handleChat = (e: React.MouseEvent, conversationId: string | null) => {
    e.stopPropagation();
    if (conversationId) {
      router.push(`/messages/${conversationId}` as Route);
    } else {
      router.push('/messages' as Route);
    }
  };

  const renderCard = (booking: Booking) => {
    const today = new Date();
    const daysUntilDue = differenceInDays(booking.endDate, today);
    const isUrgent = daysUntilDue <= 2 && booking.phase === 'active';
    const reviewDue = canReview(booking);
    const totalCost = booking.financials.rentTotal + booking.financials.deliveryFee;

    return (
      <div 
        key={booking.id}
        onClick={() => setSelectedBooking(booking)}
        className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] chrome-card bg-surface/40 hover:bg-surface/80 border border-border/30 hover:border-[var(--accent)]/40 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
      >
        
        {/* Top/Left Section: Image + Info */}
        <div className="flex flex-row gap-4 flex-1 w-full sm:w-auto">
          {/* Item-First Thumbnail */}
          <div className="relative w-[84px] sm:w-[110px] h-[84px] sm:h-[110px] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
            <img src={booking.listing.image} alt={booking.listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>

          {/* Left Info Column */}
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-semibold text-[15px] sm:text-[17px] text-foreground tracking-tight leading-tight line-clamp-2 sm:line-clamp-1">{booking.listing.title}</h3>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground mt-1 flex items-center gap-1.5">
                Host: <span className="font-medium text-foreground">{booking.counterpart.name}</span>
              </p>
            </div>
            
            <div className="mt-2 sm:mt-auto space-y-1.5">
              {/* Status Badge */}
              <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-background border border-border/50 shadow-sm w-max mb-1 sm:mb-2">
                {booking.phase === 'pending' && <span className="text-amber-500 flex items-center gap-1">Pending <span className="animate-pulse">⏳</span></span>}
                {booking.phase === 'active' && <span className="text-emerald-500">Active</span>}
                {booking.phase === 'confirmed' && <span className="text-emerald-500">Confirmed</span>}
                {reviewDue && <span className="text-amber-600">Review due</span>}
                {booking.phase === 'completed' && !reviewDue && <span className="text-foreground/60">Completed</span>}
                {booking.phase === 'cancelled' && <span className="text-rose-500">Cancelled</span>}
                {booking.phase === 'rejected' && <span className="text-rose-500">Declined</span>}
              </div>

              {booking.phase === 'pending' && (
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground/80">
                  {format(booking.startDate, 'MMM d')} – {format(booking.endDate, 'MMM d')} ({booking.totalDays} days)
                </p>
              )}
              {booking.phase === 'active' && (
                <p className={`text-[12px] sm:text-[13px] font-medium ${isUrgent ? 'text-rose-500' : 'text-foreground/80'}`}>
                  Due: {format(booking.endDate, 'MMM d')} ({daysUntilDue}d left)
                </p>
              )}
              {booking.phase === 'confirmed' && (
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground/80">
                  Starts {format(booking.startDate, 'MMM d')} (In {differenceInDays(booking.startDate, today)}d)
                </p>
              )}
              
              {booking.deliveryType === 'delivery' && (
                <p className="text-[11px] sm:text-[12px] font-semibold text-indigo-500 flex items-center gap-1">
                  🚚 Host delivering
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom/Right Section: Financials & Actions */}
        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t border-border/30 pt-3 sm:border-t-0 sm:pt-0">
          
          {/* Price */}
          <div className="text-left sm:text-right">
            <p className="font-bold text-[16px] sm:text-[18px] tracking-tight text-foreground leading-none">Rs {totalCost.toLocaleString()}</p>
            {booking.financials.securityDeposit > 0 ? (
              <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-1">+ Rs {booking.financials.securityDeposit.toLocaleString()} dep</p>
            ) : (
              <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-1">total upfront</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-0 sm:mt-5">
            {booking.phase === 'pending' && (
              <button 
                onClick={(e) => handleCancel(e, booking.id)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 sm:border-transparent hover:border-border/50 transition-all"
              >
                Cancel
              </button>
            )}
            {reviewDue ? (
              <button 
                onClick={(e) => { e.stopPropagation(); setReviewingBooking(booking); }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md shadow-foreground/10"
              >
                Write Review
              </button>
            ) : (
              booking.phase !== 'cancelled' && (
                <button 
                  onClick={(e) => handleChat(e, booking.conversation_id)}
                  className="hyper-liquid px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={15} className="opacity-80" />
                  Chat
                </button>
              )
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {pendingRequests.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Pending Requests</h2>
          <div className="flex flex-col gap-4">{pendingRequests.map(renderCard)}</div>
        </section>
      )}

      {activeRentals.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Active Rentals</h2>
          <div className="flex flex-col gap-4">{activeRentals.map(renderCard)}</div>
        </section>
      )}

      {upcomingRentals.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Upcoming Rentals</h2>
          <div className="flex flex-col gap-4">{upcomingRentals.map(renderCard)}</div>
        </section>
      )}

      {completedRentals.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Completed Rentals{reviewsNeeded > 0 ? ` · ${reviewsNeeded} review${reviewsNeeded === 1 ? '' : 's'} needed` : ''}</h2>
          <div className="flex flex-col gap-4">{completedRentals.map(renderCard)}</div>
        </section>
      )}

      {selectedBooking && (
        <BookingDetailSheet 
          booking={selectedBooking} 
          isOpen={!!selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          role="renter"
          onActionSuccess={refetch}
          onOpenReview={(b) => setReviewingBooking(b)}
        />
      )}

      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          isOpen={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          role="renter"
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

export function BookingsLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/20 p-6 text-center">
      <p className="font-semibold">We couldn’t load your rentals</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <button onClick={onRetry} className="hyper-liquid mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold">Try again</button>
    </div>
  );
}
