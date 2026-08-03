'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/lib/api-client';
import { AvailabilityCalendar } from '../pdp/AvailabilityCalendar';
import { X, Loader2, Save, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import {
  fetchBlockedDates,
  fetchListingAvailability,
  readApiError,
  saveBlockedDates,
} from '@/lib/listings/api';
import { rangeOverlapsAnyConfirmedBooking } from '@/lib/listings/booking-utils';
import type { BlockedDateRange } from '@/lib/listings/types';

interface ManageAvailabilityModalProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function ManageAvailabilityModal({
  listingId,
  listingTitle,
  onClose,
}: ManageAvailabilityModalProps) {
  const api = useApiClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRange[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<BlockedDateRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const [manualBlocks, availability] = await Promise.all([
          fetchBlockedDates(api, listingId),
          fetchListingAvailability(api, listingId),
        ]);

        if (cancelled) return;

        setBlockedDates(manualBlocks);
        setConfirmedBookings(
          availability
            .filter((range) => range.status === 'confirmed')
            .map(({ start_date, end_date }) => ({ start_date, end_date }))
        );
      } catch (err) {
        console.error('Error fetching availability:', err);
        if (!cancelled) {
          setError(await readApiError(err, 'Failed to load availability. Please try again.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [listingId, api]);

  const handleSelectDates = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range);
    setError(null);
  };

  const handleUnblockRange = (rangeToRemove: BlockedDateRange) => {
    setBlockedDates(prev =>
      prev.filter(
        r => !(r.start_date === rangeToRemove.start_date && r.end_date === rangeToRemove.end_date)
      )
    );
    setError(null);
  };

  const handleBlockSelection = () => {
    if (!selectedRange.start) return;

    const startStr = format(selectedRange.start, 'yyyy-MM-dd');
    const endStr = selectedRange.end ? format(selectedRange.end, 'yyyy-MM-dd') : startStr;
    const nextRange = { start_date: startStr, end_date: endStr };

    if (rangeOverlapsAnyConfirmedBooking(nextRange, confirmedBookings)) {
      setError('Cannot block dates that overlap a confirmed booking.');
      return;
    }

    setBlockedDates(prev => [...prev, nextRange]);
    setSelectedRange({ start: null, end: null });
    setError(null);
  };

  const handleSave = async () => {
    const overlapsConfirmed = blockedDates.some((range) =>
      rangeOverlapsAnyConfirmedBooking(range, confirmedBookings)
    );
    if (overlapsConfirmed) {
      setError('Blocked dates cannot overlap confirmed bookings.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveBlockedDates(api, listingId, blockedDates);
      onClose();
    } catch (err) {
      console.error('Error updating blocked dates:', err);
      setError(await readApiError(err, 'Failed to save availability. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--border-color)] [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--foreground)]">
              Manage Availability
            </h3>
            <p className="text-xs text-[var(--foreground)]/50 mt-0.5 truncate max-w-md">
              {listingTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--foreground)]/45 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
            <p className="text-xs text-[var(--foreground)]/60">Loading calendar...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {confirmedBookings.length > 0 && (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-xs text-amber-300">
                <CalendarClock size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Confirmed bookings are locked</p>
                  <p className="mt-1 text-[var(--foreground)]/60">
                    {confirmedBookings
                      .map((range) =>
                        range.start_date === range.end_date
                          ? format(new Date(range.start_date), 'MMM d, yyyy')
                          : `${format(new Date(range.start_date), 'MMM d')} – ${format(new Date(range.end_date), 'MMM d, yyyy')}`
                      )
                      .join(' · ')}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="border border-[var(--border-color)]/50 rounded-2xl p-2 bg-[var(--background)]/30">
              <AvailabilityCalendar
                mode="owner"
                blockedDates={blockedDates}
                selectedDates={selectedRange}
                onSelectDates={handleSelectDates}
                onUnblockRange={handleUnblockRange}
                monthsToShow={1}
              />
            </div>

            {selectedRange.start && (
              <div className="flex items-center justify-between bg-[var(--accent)]/8 border border-[var(--accent)]/20 p-4 rounded-2xl">
                <span className="text-xs font-semibold text-[var(--foreground)]/80">
                  Selected Range: {format(selectedRange.start, 'MMM d, yyyy')}
                  {selectedRange.end && ` — ${format(selectedRange.end, 'MMM d, yyyy')}`}
                </span>
                <button
                  onClick={handleBlockSelection}
                  className="px-3.5 py-1.5 bg-[var(--accent)] text-black text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                >
                  Block Selected Dates
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--foreground)]/65 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl hyper-liquid text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    Save Availability
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
