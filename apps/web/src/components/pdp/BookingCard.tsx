'use client';

import { useState } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Truck, MapPin } from 'lucide-react';

interface BookingCardProps {
  dailyRate: number;
  securityDeposit: number;
  selectedDates: { start: Date | null; end: Date | null };
  onBookingRequest: (options: { delivery: boolean }) => void;
  isSticky?: boolean;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  area?: string | null;
  minRentalDays?: number;
  maxRentalDays?: number;
}

export function BookingCard({
  dailyRate,
  securityDeposit,
  selectedDates,
  onBookingRequest,
  isSticky = true,
  deliveryAvailable = false,
  deliveryFee = 0,
  area,
  minRentalDays = 1,
  maxRentalDays,
}: BookingCardProps) {
  const [wantsDelivery, setWantsDelivery] = useState(false);

  const days =
    selectedDates.start && selectedDates.end
      ? differenceInCalendarDays(selectedDates.end, selectedDates.start)
      : 0;

  const subtotal = days * dailyRate;
  const activeDeliveryFee = wantsDelivery && deliveryAvailable ? (deliveryFee ?? 0) : 0;
  const total = subtotal + activeDeliveryFee + securityDeposit;

  // Min/max guard
  const tooShort = days > 0 && days < minRentalDays;
  const tooLong  = maxRentalDays !== undefined && days > maxRentalDays;
  const dateViolation = tooShort || tooLong;
  const canRequest = days > 0 && !dateViolation;

  const areaLabel = area
    ? area.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'the lender';

  return (
    <div
      className={cn(
        'chrome-card rounded-3xl p-6 border-border/20 shadow-xl',
        isSticky && 'sticky top-32'
      )}
    >
      {/* Rate header */}
      <div className="mb-6">
        <span className="text-3xl font-bold font-syne tracking-tight">Rs. {dailyRate.toLocaleString()}</span>
        <span className="text-foreground/60 font-medium"> / day</span>
      </div>

      {/* Date pickers — click scrolls to calendar */}
      <button
        className="w-full border border-border/20 rounded-2xl overflow-hidden mb-5 bg-background/50 hover:bg-border/5 transition-colors text-left"
        onClick={() => {
          document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="flex divide-x divide-border/20">
          <div className="p-3 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1">Pickup Date</div>
            <div className="text-sm font-medium">
              {selectedDates.start ? format(selectedDates.start, 'MMM d, yyyy') : 'Select date'}
            </div>
          </div>
          <div className="p-3 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1">Return Date</div>
            <div className="text-sm font-medium">
              {selectedDates.end ? format(selectedDates.end, 'MMM d, yyyy') : 'Select date'}
            </div>
          </div>
        </div>
      </button>

      {/* Delivery / Pickup toggle — only when listing supports delivery */}
      {deliveryAvailable && (
        <div className="mb-5 rounded-2xl border border-border/15 overflow-hidden">
          <button
            onClick={() => setWantsDelivery(false)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b border-border/15',
              !wantsDelivery ? 'bg-accent/8' : 'hover:bg-border/5'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
              !wantsDelivery ? 'border-accent' : 'border-border/40'
            )}>
              {!wantsDelivery && <div className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            <MapPin className="w-4 h-4 text-foreground/60 shrink-0" />
            <span className="font-medium flex-1">Pick up from {areaLabel}</span>
            <span className="text-foreground/50 text-xs">Free</span>
          </button>
          <button
            onClick={() => setWantsDelivery(true)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors',
              wantsDelivery ? 'bg-accent/8' : 'hover:bg-border/5'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
              wantsDelivery ? 'border-accent' : 'border-border/40'
            )}>
              {wantsDelivery && <div className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            <Truck className="w-4 h-4 text-foreground/60 shrink-0" />
            <span className="font-medium flex-1">Get it delivered</span>
            {deliveryFee > 0 && (
              <span className="text-foreground/50 text-xs">+Rs. {deliveryFee.toLocaleString()}</span>
            )}
          </button>
        </div>
      )}

      {/* Min/max day violation */}
      {dateViolation && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20 text-xs text-red-500 font-medium">
          {tooShort
            ? `Minimum rental is ${minRentalDays} day${minRentalDays !== 1 ? 's' : ''}`
            : `Maximum rental is ${maxRentalDays} day${maxRentalDays !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Price breakdown */}
      {days > 0 && !dateViolation && (
        <div className="space-y-3 mb-6 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between">
            <span className="text-foreground/80 underline decoration-border/50 underline-offset-4">
              Rs. {dailyRate.toLocaleString()} × {days} day{days !== 1 ? 's' : ''}
            </span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>

          {wantsDelivery && deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-foreground/80">Delivery fee</span>
              <span className="font-medium">Rs. {deliveryFee.toLocaleString()}</span>
            </div>
          )}

          {securityDeposit > 0 && (
            <div className="flex justify-between">
              <span className="text-foreground/80 underline decoration-border/50 underline-offset-4">
                Security deposit <span className="text-foreground/50 no-underline">(refundable)</span>
              </span>
              <span className="font-medium">Rs. {securityDeposit.toLocaleString()}</span>
            </div>
          )}

          <div className="pt-3 border-t border-border/10 flex justify-between font-bold text-lg font-syne">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        className="w-full hyper-liquid py-4 text-base tracking-wide"
        onClick={() => onBookingRequest({ delivery: wantsDelivery })}
        disabled={!canRequest}
      >
        {!selectedDates.start || !selectedDates.end
          ? 'Check availability'
          : dateViolation
          ? 'Invalid dates'
          : 'Request to Rent'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-foreground/50 font-medium">You won't be charged yet</p>
      </div>
    </div>
  );
}
