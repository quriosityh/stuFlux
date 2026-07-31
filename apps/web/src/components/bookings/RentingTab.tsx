'use client';

import React, { useState } from 'react';
import { mockRenterBookings, MockBooking } from './mockData';
import { differenceInDays, format } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import BookingDetailSheet from './BookingDetailSheet';

export default function RentingTab() {
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);

  // Sorting
  const pendingRequests = mockRenterBookings.filter(b => b.phase === 'pending').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const activeRentals = mockRenterBookings.filter(b => b.phase === 'active').sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const upcomingRentals = mockRenterBookings.filter(b => b.phase === 'confirmed').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const completedRentals = mockRenterBookings.filter(b => b.phase === 'completed').sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

  const renderCard = (booking: MockBooking) => {
    const today = new Date();
    const daysUntilDue = differenceInDays(booking.endDate, today);
    const isUrgent = daysUntilDue <= 2 && booking.phase === 'active';
    const totalCost = booking.financials.rentTotal + booking.financials.deliveryFee;

    return (
      <div 
        key={booking.id}
        onClick={() => setSelectedBooking(booking)}
        className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 rounded-[20px] bg-card/40 hover:bg-card border border-border/40 hover:border-border/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
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
                {booking.phase === 'completed' && <span className="text-foreground/60">Completed</span>}
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
                onClick={(e) => { e.stopPropagation(); }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 sm:border-transparent hover:border-border/50 transition-all"
              >
                Cancel
              </button>
            )}
            {booking.phase === 'completed' ? (
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md shadow-foreground/10"
              >
                Write Review
              </button>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="hyper-liquid px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={15} className="opacity-80" />
                Chat
              </button>
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

      {selectedBooking && (
        <BookingDetailSheet 
          booking={selectedBooking} 
          isOpen={!!selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          role="renter"
        />
      )}
    </div>
  );
}
