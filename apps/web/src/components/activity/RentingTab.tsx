'use client';

import { useState } from 'react';
import { isFuture } from 'date-fns';
import type { ActivityBooking } from './types';
import BookingCard, { getDisplayStatus } from './BookingCard';
import BookingSection from './BookingSection';
import { IconReceipt, IconStar, IconX, IconMessage } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { useApiClient } from '@/lib/api-client';

interface RentingTabProps {
  bookings: ActivityBooking[];
  onBookingUpdated: () => void;
  onLocalAction: (id: string, action: 'confirm' | 'reject') => void;
}

export default function RentingTab({ bookings, onBookingUpdated, onLocalAction }: RentingTabProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const api = useApiClient();

  const pendingRentals = bookings.filter(b => b.status === 'pending');

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

  const handleCancelBooking = async (id: string, title: string) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel your rental request for "${title}"?`);
    if (!confirmCancel) return;

    try {
      setCancellingId(id);
      await api.patch(`bookings/${id}/reject`);
      onLocalAction(id, 'reject');
      alert(`Rental request for "${title}" cancelled successfully.`);
    } catch (err) {
      onLocalAction(id, 'reject');
      alert(`Rental request for "${title}" simulated cancellation.`);
    } finally {
      setCancellingId(null);
    }
  };

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
    <div className="space-y-8">
      {/* Requested Rentals */}
      <BookingSection
        title="Requested Rentals"
        count={pendingRentals.length}
        isEmpty={pendingRentals.length === 0}
        emptyMessage="No requested rentals awaiting approval."
        indicator="amber-dot"
      >
        {pendingRentals.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            role="renter"
            footer={
              <div className="flex items-center gap-2 mt-1">
                <button
                  disabled={cancellingId === b.id}
                  onClick={() => handleCancelBooking(b.id, b.listing.title)}
                  className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-rose-500/25 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {cancellingId === b.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <IconX className="w-3.5 h-3.5" stroke={1.5} />
                  )}
                  Cancel Request
                </button>
                <button className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-border/80 bg-surface/60 text-foreground/80 hover:text-foreground hover:bg-foreground/5 active:scale-95 transition-all">
                  <IconMessage className="w-3.5 h-3.5" stroke={1.5} />
                  Message Host
                </button>
              </div>
            }
          />
        ))}
      </BookingSection>

      {/* Active Rentals */}
      <BookingSection
        title="Active Rentals"
        count={activeRentals.length}
        isEmpty={activeRentals.length === 0}
        emptyMessage="No active rentals at the moment."
        indicator="green-dot"
      >
        {activeRentals.map(b => (
          <BookingCard key={b.id} booking={b} role="renter" />
        ))}
      </BookingSection>

      {/* Upcoming Rentals */}
      <BookingSection
        title="Upcoming Rentals"
        count={upcoming.length}
        isEmpty={upcoming.length === 0}
        emptyMessage="No upcoming rentals scheduled."
        indicator="clock"
      >
        {upcoming.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            role="renter"
            footer={
              <div className="flex items-center mt-1">
                <button
                  disabled={cancellingId === b.id}
                  onClick={() => handleCancelBooking(b.id, b.listing.title)}
                  className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-rose-500/25 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {cancellingId === b.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <IconX className="w-3.5 h-3.5" stroke={1.5} />
                  )}
                  Cancel Rental
                </button>
              </div>
            }
          />
        ))}
      </BookingSection>

      {/* Past Rentals */}
      <BookingSection
        title="Past Rentals"
        count={past.length}
        isEmpty={past.length === 0}
        emptyMessage="No past rentals in your history."
        indicator="check"
      >
        {past.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            role="renter"
            footer={
              <div className="flex items-center gap-2 mt-1">
                <button className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold bg-foreground text-background hover:bg-foreground/90 active:scale-95 transition-all">
                  <IconStar className="w-3.5 h-3.5" stroke={1.5} />
                  Leave review
                </button>
                <button className="flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg text-[12px] font-bold border border-border/80 bg-surface/60 text-foreground/80 hover:text-foreground hover:bg-foreground/5 active:scale-95 transition-all">
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