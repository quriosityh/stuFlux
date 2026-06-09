'use client';

import { useState, useEffect, useRef } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapPin, Search, AlertCircle } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step5Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

const LAHORE_AREAS = [
  'Gulberg I', 'Gulberg II', 'Gulberg III', 'Gulberg V',
  'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8',
  'Johar Town',
  'Model Town',
  'Garden Town',
  'Faisal Town',
  'Cavalry Ground',
  'Bahria Town',
  'Wapda Town',
  'Valencia Town',
  'Iqbal Town',
  'Samanabad',
  'Shadman',
  'Township',
  'Green Town',
  'Paragon City',
  'Askari IX', 'Askari X', 'Askari XI',
  'Mall Road',
  'Cantt'
];

export function Step5Location({ data, updateData, onNext, onBack, hideFooter }: Step5Props) {
  const [city] = useState('Lahore'); // Locked to Lahore as per user instructions
  const [address, setAddress] = useState(data.address || ''); // Stores the area
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<{ address?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isValid = city.trim().length > 0 && address.trim().length > 0;

  // Filter suggestions
  useEffect(() => {
    if (address.trim().length > 0) {
      const filtered = LAHORE_AREAS.filter(area =>
        area.toLowerCase().includes(address.toLowerCase()) &&
        area.toLowerCase() !== address.toLowerCase()
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [address]);

  // Handle clicking outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validation when input changes after click submit
  useEffect(() => {
    if (hasAttemptedSubmit) {
      if (!address.trim()) {
        setErrors({ address: 'Please specify the area in Lahore.' });
      } else {
        setErrors({});
      }
    }
  }, [address, hasAttemptedSubmit]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT')) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [address, city]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    if (!address.trim()) {
      setErrors({ address: 'Please specify the area in Lahore.' });
      return;
    }
    setErrors({});
    updateData({ city, address });
    onNext();
  };

  const handleSelectSuggestion = (val: string) => {
    setAddress(val);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          Step 5 of 5
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Where is the item located?</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">
          StuFlux currently facilitates sharing in Lahore. Specify your exact area to connect with nearby renters.
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto w-full">
        {/* City Input (Read-only / Presets to Lahore) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">City</label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#14141E]/40 px-4 py-3 cursor-not-allowed">
            <MapPin className="h-4 w-4 text-white/30" />
            <span className="text-sm font-medium text-white/60">Lahore (Currently Supported City)</span>
          </div>
        </div>

        {/* Area Autocomplete Input */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
            Which area in Lahore? <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
          </label>
          <div className={cn(
            'flex items-center gap-3 rounded-[1.5rem] border bg-[#14141E] px-4 py-3.5 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-300',
            errors.address ? 'border-red-500/50' : 'border-white/10'
          )}>
            <Search className="h-5 w-5 text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Search or enter area (e.g. Gulberg III, DHA Phase 5...)"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent border-none text-sm text-white outline-none placeholder:text-white/20"
            />
          </div>

          {/* Error Message */}
          {errors.address && (
            <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.address}</span>
            </div>
          )}

          {/* Autocomplete Suggestions Inline Panel */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-3 rounded-2xl border border-[#2A2A35]/80 bg-[#161622]/60 p-3.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent/70">Suggested Areas</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/80 hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all duration-250 cursor-pointer"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-between">
          <button onClick={onBack} type="button" className="px-6 py-3 rounded-full font-bold transition-colors text-white/50 hover:text-white">
            ← Back
          </button>
          <button
            onClick={handleNext}
            type="button"
            className={cn(
              'px-8 py-3 rounded-full font-bold transition-all duration-300 active:scale-95 transform-gpu',
              isValid ? 'liquid-button' : 'glass-spotlight opacity-50 cursor-not-allowed'
            )}
          >
            Next: Review Listing
          </button>
        </div>
      )}
    </div>
  );
}
