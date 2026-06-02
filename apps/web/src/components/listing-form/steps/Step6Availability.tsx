import { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ListingFormData } from '../types';
import { AvailabilityCalendar } from '@/components/pdp/AvailabilityCalendar';

type Step6AvailabilityProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export function Step6Availability({ data, updateData, onNext, onBack, onSkip }: Step6AvailabilityProps) {
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const handleSelectDates = (dates: { start: Date | null; end: Date | null }) => {
    setSelectedDates(dates);
    
    // When a full range is selected, add it to blocked_dates immediately and clear selection
    if (dates.start && dates.end) {
      const newBlock = {
        start_date: format(dates.start, 'yyyy-MM-dd'),
        end_date: format(dates.end, 'yyyy-MM-dd'),
      };
      updateData({ blocked_dates: [...data.blocked_dates, newBlock] });
      setSelectedDates({ start: null, end: null }); // Reset selection
    }
  };

  const removeBlockedRange = (index: number) => {
    const updated = [...data.blocked_dates];
    updated.splice(index, 1);
    updateData({ blocked_dates: updated });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">Block unavailable dates</h2>
          <span className="text-xs font-semibold bg-[#2A2A35] text-white/70 px-2 py-1 rounded-md uppercase tracking-wider">
            Optional
          </span>
        </div>
        <p className="text-white/50 text-sm">
          Tap dates when your item isn't available for rent. You can always update this later.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-[2rem] overflow-hidden">
          <AvailabilityCalendar 
            blockedDates={data.blocked_dates}
            selectedDates={selectedDates}
            onSelectDates={handleSelectDates}
          />
        </div>

        {/* Blocked Dates List */}
        {data.blocked_dates.length > 0 && (
          <div className="mt-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Blocked Dates
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.blocked_dates.map((range, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#2A2A35] text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-accent" />
                  <span>
                    {format(new Date(range.start_date), 'MMM d')} - {format(new Date(range.end_date), 'MMM d')}
                  </span>
                  <button 
                    onClick={() => removeBlockedRange(idx)}
                    className="ml-1 p-0.5 text-white/50 hover:text-red-400 transition-colors rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-[#2A2A35] flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-sm text-white/50 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 font-semibold text-sm text-white hover:text-accent transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="liquid-button px-8 py-3 font-bold text-sm text-black"
          >
            Review Listing →
          </button>
        </div>
      </div>
    </div>
  );
}
