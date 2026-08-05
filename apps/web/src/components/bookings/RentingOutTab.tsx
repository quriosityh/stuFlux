'use client';

import React, { useState } from 'react';
import { useBookings, type Booking } from '@/hooks/useBookings';
import { differenceInDays, format } from 'date-fns';
import { MessageCircle, Star, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import BookingDetailSheet from './BookingDetailSheet';
import ReviewModal from './ReviewModal';
import { BookingsLoadError } from './RentingTab';

export default function RentingOutTab() {
  const router = useRouter();
  const { bookings, isLoading, error, refetch } = useBookings('owner');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        <p className="text-sm text-muted-foreground">Loading received requests...</p>
      </div>
    );
  }

  if (error) {
    return <BookingsLoadError message={error.message} onRetry={refetch} />;
  }

  // An elapsed booking should remain reviewable even if the API has not yet
  // persisted its transition from `confirmed` to `completed`.
  const canReview = (booking: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);
    return !booking.hasReviewed && (
      booking.phase === 'completed' ||
      (booking.phase === 'confirmed' && endDate < today)
    );
  };

  const pendingApprovals = bookings.filter(b => b.phase === 'pending').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const upcomingRentals  = bookings.filter(b => b.phase === 'confirmed' && !canReview(b)).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const currentlyOut     = bookings.filter(b => b.phase === 'active').sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  // Only show bookings that still need a review — once reviewed they disappear.
  const pendingReviews   = bookings.filter(canReview).sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

  const hasActiveRequests = pendingApprovals.length > 0 || upcomingRentals.length > 0 || currentlyOut.length > 0 || pendingReviews.length > 0;

  if (bookings.length === 0 || !hasActiveRequests) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border border-dashed border-border/60 rounded-3xl bg-card/20">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Calendar className="text-muted-foreground" size={24} />
        </div>
        <h3 className="font-semibold text-lg">No active requests</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          List your items for rent. Once other students request them, they will show up here.
        </p>
        <button
          onClick={() => router.push('/listings/new' as Route)}
          className="hyper-liquid px-5 py-2.5 rounded-xl font-semibold text-[14px]"
        >
          Create Listing
        </button>
      </div>
    );
  }

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
    const earnings = booking.financials.rentTotal + booking.financials.deliveryFee;

    return (
      <div 
        key={booking.id}
        onClick={() => setSelectedBooking(booking)}
        className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] chrome-card bg-surface/40 hover:bg-surface/80 border border-border/30 hover:border-[var(--accent)]/40 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
      >
        
        {/* Top/Left Section: Avatar + Info */}
        <div className="flex flex-row gap-4 sm:gap-5 w-full sm:w-auto flex-1 items-start">
          
          {/* Person-First Avatar block */}
          <div className="flex flex-col items-center shrink-0 w-[70px] sm:w-[90px] pt-1">
            <div className="w-[52px] sm:w-[64px] h-[52px] sm:h-[64px] rounded-full overflow-hidden border-2 border-border/50 shadow-sm group-hover:scale-105 transition-transform">
              <img src={booking.counterpart.avatar} alt={booking.counterpart.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-1 sm:mt-2 text-center w-full">
              <p className="text-[12px] sm:text-[13px] font-semibold text-foreground line-clamp-1 leading-tight">{booking.counterpart.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5 sm:mt-1 text-muted-foreground bg-muted/50 rounded-full py-0.5 w-max mx-auto px-1.5 sm:px-2">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground/80">{booking.counterpart.rating}</span>
              </div>
            </div>
          </div>

          {/* Left Info Column */}
          <div className="flex flex-col justify-between flex-1 pt-0 sm:pt-1 sm:pl-2">
            <div>
              <h3 className="font-semibold text-[15px] sm:text-[17px] text-foreground tracking-tight leading-tight line-clamp-2 sm:line-clamp-1">{booking.listing.title}</h3>
            </div>
            
            <div className="mt-2 sm:mt-auto space-y-1.5">
              {/* Status Badge */}
              <div className="my-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-background border border-border/50 shadow-sm w-max mb-1 sm:mb-2">
                {booking.phase === 'active' && <span className="text-emerald-500">Active</span>}
                {booking.phase === 'pending' && <span className="text-amber-500 flex items-center gap-1">Pending</span>}
                {booking.phase === 'confirmed' && <span className="text-emerald-500">Confirmed</span>}
                {reviewDue && <span className="text-amber-600">Review due</span>}
                {booking.phase === 'completed' && !reviewDue && <span className="text-foreground/60">Completed</span>}
                {booking.phase === 'cancelled' && <span className="text-rose-500">Cancelled</span>}
                {booking.phase === 'rejected' && <span className="text-rose-500">Declined</span>}
              </div>

              {booking.phase === 'active' && (
                <p className={`text-[12px] sm:text-[13px] font-medium ${isUrgent ? 'text-rose-500' : 'text-foreground/80'}`}>
                  Due: {format(booking.endDate, 'MMM d')} ({daysUntilDue}d left)
                </p>
              )}
              {booking.phase === 'pending' && (
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground/80">
                  {format(booking.startDate, 'MMM d')} – {format(booking.endDate, 'MMM d')} ({booking.totalDays} days)
                </p>
              )}
              {booking.phase === 'confirmed' && (
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground/80">
                  Starts {format(booking.startDate, 'MMM d')} (In {differenceInDays(booking.startDate, today)}d)
                </p>
              )}

              {booking.deliveryType === 'delivery' && (booking.phase === 'confirmed' || booking.phase === 'active') && (
                <p className="text-[11px] sm:text-[12px] font-semibold text-indigo-500 flex items-center gap-1 mt-1">
                  🚚 You deliver
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom/Right Section: Financials & Actions */}
        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t border-border/30 pt-3 sm:border-t-0 sm:pt-0">
          
          {/* Price */}
          <div className="text-left sm:text-right">
            <p className="font-bold text-[16px] sm:text-[18px] tracking-tight text-foreground leading-none">Rs {earnings.toLocaleString()}</p>
            <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-1">{booking.phase === 'pending' ? 'potential earnings' : 'earned'}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-0 sm:mt-5">
            {booking.phase === 'pending' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleChat(e, booking.conversation_id)}
                  className="p-2 sm:px-3.5 sm:py-2 text-[12px] sm:text-[13px] rounded-lg sm:rounded-xl bg-card border border-border/50 hover:bg-muted flex items-center justify-center gap-1.5 shadow-sm text-foreground"
                  title="Message renter"
                >
                  <MessageCircle size={15} className="opacity-80" />
                  <span className="hidden sm:inline">Message</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                  className="hyper-liquid px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5"
                >
                  View Request →
                </button>
              </div>
            )}
            {reviewDue && (
              <button 
                onClick={(e) => { e.stopPropagation(); setReviewingBooking(booking); }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md shadow-foreground/10"
              >
                Write Review
              </button>
            )}
            {(booking.phase === 'active' || booking.phase === 'confirmed') && (
              <button 
                onClick={(e) => handleChat(e, booking.conversation_id)}
                className="hyper-liquid px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle size={15} className="opacity-80" />
                {booking.phase === 'active' ? 'Message' : 'Coordinate'}
              </button>
            )}
          </div>
          
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {pendingApprovals.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Pending Approvals</h2>
          <div className="flex flex-col gap-4">{pendingApprovals.map(renderCard)}</div>
        </section>
      )}

      {upcomingRentals.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Upcoming Rentals</h2>
          <div className="flex flex-col gap-4">{upcomingRentals.map(renderCard)}</div>
        </section>
      )}

      {currentlyOut.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Currently Out</h2>
          <div className="flex flex-col gap-4">{currentlyOut.map(renderCard)}</div>
        </section>
      )}

      {pendingReviews.length > 0 && (
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Pending Reviews · {pendingReviews.length}</h2>
          <div className="flex flex-col gap-4">{pendingReviews.map(renderCard)}</div>
        </section>
      )}

      {selectedBooking && (
        <BookingDetailSheet 
          booking={selectedBooking} 
          isOpen={!!selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          role="lender"
          onActionSuccess={refetch}
          onOpenReview={(b) => setReviewingBooking(b)}
        />
      )}

      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          isOpen={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          role="lender"
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
