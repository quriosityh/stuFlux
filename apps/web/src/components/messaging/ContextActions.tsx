import { Conversation } from './types';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export function ContextActions({ conversation }: { conversation: Conversation }) {
  const { phase, role, listingId } = conversation;

  const hasNoActions = phase === 'inquiry' && role === 'lender';

  if (hasNoActions) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Actions</h3>
      
      {phase === 'inquiry' && role === 'renter' && (
        <Link href={`/listings/${listingId}#availability`} className="hyper-liquid w-full py-3 text-sm flex items-center justify-center gap-2">
          <Calendar size={16} />
          <span>Select Dates to Book</span>
        </Link>
      )}

      {phase === 'pending' && role === 'lender' && (
        <>
          <button className="hyper-liquid w-full py-3 text-sm">
            Approve Request
          </button>
          <button className="w-full py-3 text-sm font-bold text-red-500 border border-red-500/30 rounded-full hover:bg-red-500/10 transition-colors">
            Decline
          </button>
        </>
      )}

      {phase === 'pending' && role === 'renter' && (
        <button className="w-full py-3 text-sm font-bold text-red-500 border border-red-500/30 rounded-full hover:bg-red-500/10 transition-colors">
          Cancel Request
        </button>
      )}

      {phase === 'confirmed' && (
        <button className="secondary-button w-full py-3 text-sm font-bold">
          View Booking Details
        </button>
      )}

      {phase === 'ongoing' && (
        <div className="flex flex-col gap-2">
           <button className="secondary-button w-full py-3 text-sm font-bold">
             View Booking Details
           </button>
        </div>
      )}

      {phase === 'completed' && (
        <>
          <button className="hyper-liquid w-full py-3 text-sm">
            Leave a Review
          </button>
          <button className="secondary-button w-full py-3 text-sm font-bold">
            Rent Again
          </button>
        </>
      )}
    </div>
  );
}
