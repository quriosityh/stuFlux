'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/lib/api-client';
import { AvailabilityCalendar } from '../pdp/AvailabilityCalendar';
import { X, Loader2, Save } from 'lucide-react';
import { format, startOfDay } from 'date-fns';

interface BlockedRange {
  start_date: string;
  end_date: string;
}

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
  const [blockedDates, setBlockedDates] = useState<BlockedRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlockedDates() {
      try {
        const res = await api.get(`listings/${listingId}/blocked-dates`).json<{ data: BlockedRange[] }>();
        setBlockedDates(res.data || []);
      } catch (err) {
        console.error('Error fetching blocked dates:', err);
        setError('Failed to load availability. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchBlockedDates();
  }, [listingId, api]);

  const handleSelectDates = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range);
  };

  const handleUnblockRange = (rangeToRemove: BlockedRange) => {
    setBlockedDates(prev =>
      prev.filter(
        r => !(r.start_date === rangeToRemove.start_date && r.end_date === rangeToRemove.end_date)
      )
    );
  };

  const handleBlockSelection = () => {
    if (!selectedRange.start) return;
    const startStr = format(selectedRange.start, 'yyyy-MM-dd');
    const endStr = selectedRange.end ? format(selectedRange.end, 'yyyy-MM-dd') : startStr;

    setBlockedDates(prev => [
      ...prev,
      { start_date: startStr, end_date: endStr }
    ]);
    setSelectedRange({ start: null, end: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put(`listings/${listingId}/blocked-dates`, {
        json: {
          blocked_dates: blockedDates.map(d => ({
            start_date: d.start_date,
            end_date: d.end_date
          }))
        }
      }).json();
      onClose();
    } catch (err) {
      console.error('Error updating blocked dates:', err);
      setError('Failed to save availability. Please try again.');
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
