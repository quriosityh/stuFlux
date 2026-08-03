'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/lib/api-client';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import {
  fetchListingOwnerBookings,
  readApiError,
  updateListingStatus,
} from '@/lib/listings/api';
import { listingHasActiveOrUpcomingBookings } from '@/lib/listings/booking-utils';
import type { OwnerBookingSnapshot } from '@/lib/listings/types';

interface DeleteConfirmationModalProps {
  listingId: string;
  listingTitle: string;
  ownerBookings?: OwnerBookingSnapshot[];
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmationModal({
  listingId,
  listingTitle,
  ownerBookings,
  onClose,
  onDeleted,
}: DeleteConfirmationModalProps) {
  const api = useApiClient();
  const [checking, setChecking] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [hasActiveBookings, setHasActiveBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkBookings() {
      if (ownerBookings) {
        setHasActiveBookings(listingHasActiveOrUpcomingBookings(listingId, ownerBookings));
        setChecking(false);
        return;
      }

      try {
        const bookings = await fetchListingOwnerBookings(api, listingId);
        if (!cancelled) {
          setHasActiveBookings(listingHasActiveOrUpcomingBookings(listingId, bookings));
        }
      } catch (err) {
        console.error('Error checking bookings:', err);
        if (!cancelled) {
          setError(await readApiError(err, 'Failed to verify active bookings. Please try again.'));
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    checkBookings();
    return () => {
      cancelled = true;
    };
  }, [listingId, api, ownerBookings]);

  const handleDelete = async () => {
    if (hasActiveBookings) return;
    setDeleting(true);
    setError(null);
    try {
      await updateListingStatus(api, listingId, 'archived');
      onDeleted();
    } catch (err) {
      setError(await readApiError(err, 'Failed to delete listing. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={20} />
            Delete Listing
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--foreground)]/45 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {checking ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
            <p className="text-xs text-[var(--foreground)]/60">Checking active bookings...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hasActiveBookings ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm leading-relaxed">
                <strong className="block mb-1 font-bold">Cannot delete listing</strong>
                Cannot delete item with active or upcoming bookings. Please complete or resolve active bookings first.
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">
                Delete listing? <strong className="text-[var(--foreground)]">&ldquo;{listingTitle}&rdquo;</strong> will be archived and removed from the marketplace. This cannot be undone.
              </p>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--foreground)]/65 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              {!hasActiveBookings && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
