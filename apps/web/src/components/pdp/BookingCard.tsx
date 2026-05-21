'use client';

import { format, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface BookingCardProps {
  dailyRate: number;
  securityDeposit: number;
  selectedDates: { start: Date | null; end: Date | null };
  onBookingRequest: () => void;
  isSticky?: boolean;
}

export function BookingCard({ 
  dailyRate, 
  securityDeposit, 
  selectedDates, 
  onBookingRequest,
  isSticky = true
}: BookingCardProps) {
  const days = selectedDates.start && selectedDates.end 
    ? differenceInCalendarDays(selectedDates.end, selectedDates.start) 
    : 0;
    
  const subtotal = days * dailyRate;
  const total = subtotal + securityDeposit;

  return (
    <div className={cn(
      "chrome-card rounded-3xl p-6 border-border/20 shadow-xl",
      isSticky && "sticky top-32"
    )}>
      <div className="mb-6">
        <span className="text-3xl font-bold font-syne tracking-tight">Rs. {dailyRate.toLocaleString()}</span>
        <span className="text-foreground/60 font-medium"> / day</span>
      </div>

      <button 
        className="w-full border border-border/20 rounded-2xl overflow-hidden mb-6 bg-background/50 hover:bg-border/5 transition-colors text-left"
        onClick={() => {
          document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="flex divide-x divide-border/20 border-b border-border/20">
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

      {days > 0 && (
        <div className="space-y-4 mb-6 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between">
            <span className="text-foreground/80 underline decoration-border/50 underline-offset-4">Rs. {dailyRate.toLocaleString()} × {days} days</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/80 underline decoration-border/50 underline-offset-4">Security deposit (refundable)</span>
            <span className="font-medium">Rs. {securityDeposit.toLocaleString()}</span>
          </div>
          
          <div className="pt-4 border-t border-border/10 flex justify-between font-bold text-lg font-syne">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button 
        className="w-full hyper-liquid py-4 text-base tracking-wide"
        onClick={onBookingRequest}
        disabled={!selectedDates.start || !selectedDates.end}
      >
        {!selectedDates.start || !selectedDates.end ? 'Check availability' : 'Request to Rent'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-foreground/50 font-medium">You won't be charged yet</p>
      </div>
    </div>
  );
}
