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

  const start = rentalPeriod?.startDate ? new Date(rentalPeriod.startDate) : null;
  const end = rentalPeriod?.endDate ? new Date(rentalPeriod.endDate) : null;
  const days = start && end
    ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
    : 0;
  const total = dailyRate * days;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Booking Details</h3>
        <PhaseBadge phase={phase} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs opacity-60">Dates</span>
          <span className="font-bold text-sm">{rentalPeriod?.startDate ?? '—'} → {rentalPeriod?.endDate ?? '—'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs opacity-60">Duration</span>
          <span className="font-bold text-sm">{days} days</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
        <span className="font-medium text-sm">Total Price</span>
        <span className="font-bold text-lg text-[var(--accent)]">Rs. {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
