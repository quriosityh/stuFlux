'use client';

import { isFuture, isPast } from 'date-fns';
import type { ActivityBooking } from './types';
import BookingCard, { getDisplayStatus } from './BookingCard';
import BookingSection from './BookingSection';
import { IconReceipt, IconStar } from '@tabler/icons-react';

interface RentingTabProps {
  bookings: ActivityBooking[];
}

export default function RentingTab({ bookings }: RentingTabProps) {
  const activeRentals = bookings.filter(b => {
    if (b.status !== 'confirmed') return false;
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    const now = new Date();
    return start <= now && end >= now;
  });

  const upcoming = bookings.filter(b => {
    if (b.status !== 'confirmed') return false;
    return isFuture(new Date(b.start_date));
  });

  const past = bookings.filter(b => {
    const status = getDisplayStatus(b);
    return status === 'completed' || status === 'declined';
  });

  const isEmpty = bookings.length === 0;

  if (isEmpty) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] text-foreground/40">No rentals yet.</p>
        <p className="text-[12px] text-foreground/25 mt-1">Browse listings to start renting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active */}
      <BookingSection
        title="Active Rentals"
        count={activeRentals.length}
        isEmpty={activeRentals.length === 0}
        indicator="green-dot"
      >
        {activeRentals.map(b => (
          <BookingCard key={b.id} booking={b} role="renter" />
        ))}
      </BookingSection>

      {/* Upcoming */}
      <BookingSection
        title="Upcoming"
        count={upcoming.length}
        isEmpty={upcoming.length === 0}
        indicator="clock"
      >
        {upcoming.map(b => (
          <BookingCard key={b.id} booking={b} role="renter" />
        ))}
      </BookingSection>

      {/* Past */}
      <BookingSection
        title="Past Rentals"
        count={past.length}
        isEmpty={past.length === 0}
        indicator="check"
      >
        {past.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            role="renter"
            footer={
              <div className="flex items-center gap-2 mt-2">
                <button className="flex items-center gap-1.5 px-[12px] py-[5px] rounded-[6px] text-[12px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
                  <IconStar className="w-3.5 h-3.5" stroke={1.5} />
                  Leave review
                </button>
                <button className="flex items-center gap-1.5 px-[12px] py-[5px] rounded-[6px] text-[12px] font-medium border border-border/60 bg-surface text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <IconReceipt className="w-3.5 h-3.5" stroke={1.5} />
                  Receipt
                </button>
              </div>
            }
          />
        ))}
      </BookingSection>
    </div>
  );
}
