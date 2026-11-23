import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Conversation } from './types';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export function ContextActions({ conversation }: { conversation: Conversation }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { phase, role, listingId, bookingId } = conversation;
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleBookingAction = async (action: 'confirm' | 'reject' | 'cancel') => {
    if (!bookingId) return;
    setLoadingAction(action);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/proxy/bookings/${bookingId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(`Failed to ${action} booking:`, err);
    } finally {
      setLoadingAction(null);
    }
  };

  const hasNoActions = phase === 'inquiry' && role === 'lender';

  if (hasNoActions) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-syne font-bold text-sm text-[var(--foreground)] opacity-60 uppercase tracking-wider">Actions</h3>
      
      {phase === 'inquiry' && role === 'renter' && (
        <Link href={{ pathname: `/listings/${listingId}`, hash: 'availability' }} className="hyper-liquid w-full py-3 text-sm flex items-center justify-center gap-2">
          <Calendar size={16} />
          <span>Select Dates to Book</span>
        </Link>
      )}

      {phase === 'pending' && role === 'lender' && (
        <>
          <button 
            onClick={() => handleBookingAction('confirm')}
            disabled={!!loadingAction}
            className="hyper-liquid w-full py-3 text-sm disabled:opacity-50"
          >
            {loadingAction === 'confirm' ? 'Approving...' : 'Approve Request'}
          </button>
          <button 
            onClick={() => handleBookingAction('reject')}
            disabled={!!loadingAction}
            className="w-full py-3 text-sm font-bold text-red-500 border border-red-500/30 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {loadingAction === 'reject' ? 'Declining...' : 'Decline'}
          </button>
        </>
      )}

      {phase === 'pending' && role === 'renter' && (
        <button 
          onClick={() => handleBookingAction('cancel')}
          disabled={!!loadingAction}
          className="w-full py-3 text-sm font-bold text-red-500 border border-red-500/30 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {loadingAction === 'cancel' ? 'Cancelling...' : 'Cancel Request'}
        </button>
      )}

      {(phase === 'confirmed' || phase === 'ongoing') && (
        <button 
          onClick={() => router.push('/bookings' as any)}
          className="secondary-button w-full py-3 text-sm font-bold"
        >
          View Booking Details
        </button>
      )}

      {phase === 'completed' && (
        <>
          <button 
            onClick={() => router.push('/bookings' as any)}
            className="hyper-liquid w-full py-3 text-sm"
          >
            Leave a Review
          </button>
          <Link 
            href={`/listings/${listingId}` as any}
            className="secondary-button w-full py-3 text-sm font-bold text-center block"
          >
            Rent Again
          </Link>
        </>
      )}
    </div>
  );
}

