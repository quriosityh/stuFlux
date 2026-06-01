import { cn } from '@/lib/utils';
import { Conversation } from './types';

export function ContextBookingDetails({ conversation }: { conversation: Conversation }) {
  const { phase, rentalPeriod, dailyRate } = conversation;
  
  const getPhaseBadgeClasses = (phase: string) => {
    switch(phase) {
      case 'inquiry': return 'border border-[var(--foreground)] border-opacity-30 text-[var(--foreground)] opacity-50 bg-transparent';
      case 'pending': return 'bg-amber-500 text-black border-transparent';
      case 'confirmed': return 'bg-[var(--accent)] text-black border-transparent';
      case 'ongoing': return 'bg-[var(--accent)] text-black animate-[pulse_3s_ease-in-out_infinite] border-transparent shadow-[0_0_8px_var(--accent)]';
      case 'completed': return 'border border-[var(--foreground)] border-opacity-20 text-[var(--foreground)] opacity-40 bg-transparent';
      default: return '';
    }
  };
  
  if (phase === 'inquiry') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Booking Details</h3>
          <span className={cn("text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0", getPhaseBadgeClasses(phase))}>
            {phase}
          </span>
        </div>
        <p className="text-sm font-medium">Inquiry only — no dates selected yet.</p>
      </div>
    );
  }

  // Calculate days for mock
  const days = 3; 
  const total = dailyRate * days;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Booking Details</h3>
        <span className={cn("text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0", getPhaseBadgeClasses(phase))}>
          {phase}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs opacity-60">Dates</span>
          <span className="font-bold text-sm">{rentalPeriod?.startDate} → {rentalPeriod?.endDate}</span>
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
