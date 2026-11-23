import { cn } from '@/lib/utils';
import { Conversation } from './types';
import { PhaseBadge } from './PhaseBadge';

export function ContextBookingDetails({ conversation }: { conversation: Conversation }) {
  const { phase, rentalPeriod, dailyRate } = conversation;

  if (phase === 'inquiry') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Booking Details</h3>
          <PhaseBadge phase={phase} />
        </div>
        <p className="text-sm font-medium">Inquiry only — no dates selected yet.</p>
      </div>
    );
  }

  const rawStartStr = rentalPeriod?.rawStartDate || rentalPeriod?.startDate;
  const rawEndStr = rentalPeriod?.rawEndDate || rentalPeriod?.endDate;

  const start = rawStartStr ? new Date(rawStartStr) : null;
  const end = rawEndStr ? new Date(rawEndStr) : null;

  const isValidDates = Boolean(start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()));
  const days = isValidDates
    ? Math.max(1, Math.round((end!.getTime() - start!.getTime()) / 86_400_000))
    : 0;

  const rate = Number(dailyRate) || 0;
  const total = conversation.bookingTotalAmount ?? (rate * days);
  const formattedTotal = isNaN(total) ? '—' : total.toLocaleString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Booking Details</h3>
        <PhaseBadge phase={phase} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs opacity-60">Dates</span>
          <span className="font-bold text-sm">{rentalPeriod?.startDate || '—'} → {rentalPeriod?.endDate || '—'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs opacity-60">Duration</span>
          <span className="font-bold text-sm">{days > 0 ? `${days} day${days === 1 ? '' : 's'}` : '—'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
        <span className="font-medium text-sm">Total Price</span>
        <span className="font-bold text-lg text-[var(--accent)]">
          {formattedTotal !== '—' ? `Rs. ${formattedTotal}` : '—'}
        </span>
      </div>
    </div>
  );
}
