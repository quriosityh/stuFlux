'use client';

import { useState, useEffect } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step2Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '💻', description: 'Cameras, laptops, audio gear, and tech rentals.' },
  { id: 2, name: 'Furniture', icon: '🛋️', description: 'Home, office, and staging pieces with presence.' },
  { id: 3, name: 'Gaming', icon: '🎮', description: 'Consoles, controllers, and immersive play setups.' },
  { id: 4, name: 'Fashion & Accessories', icon: '👗', description: 'Wearables, bags, and styling pieces for the moment.' },
  { id: 5, name: 'Events & Party', icon: '🎉', description: 'Decor, sound, and event-ready essentials.' },
  { id: 6, name: 'Others', icon: '📦', description: 'Anything else that deserves a clean listing.' },
];

export function Step2Basics({ data, updateData, onNext, onBack, hideFooter }: Step2Props) {
  const [title, setTitle] = useState(data.title || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(data.category_id);
  const [errors, setErrors] = useState<{ title?: string; categoryId?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isValid = title.trim().length > 0 && categoryId !== undefined;

  // Run validation checks when values change if user has attempted to submit
  useEffect(() => {
    if (hasAttemptedSubmit) {
      const newErrors: typeof errors = {};
      if (!title.trim()) {
        newErrors.title = 'Listing title is required.';
      }
      if (categoryId === undefined) {
        newErrors.categoryId = 'Please select a category.';
      }
      setErrors(newErrors);
    }
  }, [title, categoryId, hasAttemptedSubmit]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // If focusing in text area/inputs, or generally inside page
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'SELECT')) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [title, categoryId]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = 'Listing title is required.';
    }
    if (categoryId === undefined) {
      newErrors.categoryId = 'Please select a category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateData({ title, category_id: categoryId });
    onNext();
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Step 2 of 5
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Basics</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">
          Choose a strong, simple title and categorize your item accurately.
        </p>
      </div>

      <div className="space-y-8">
        {/* Title Field */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
            Listing title <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
          </label>
          <div className={cn(
            'rounded-[1.5rem] border bg-[#14141E] px-4 py-3 shadow-sm transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50',
            errors.title ? 'border-red-500/50 focus-within:border-red-500/70 focus-within:ring-red-500/50' : 'border-white/10'
          )}>
            <input
              type="text"
              placeholder="e.g. Professional DJ Set with Turntables"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border-none bg-transparent text-center font-display text-2xl font-bold tracking-tight text-white placeholder:text-white/18 outline-none sm:text-3xl"
            />
            <div className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
              {title.length}/100
            </div>
          </div>
          {errors.title && (
            <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Category Field */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
            Category <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
          </label>
          {errors.categoryId && (
            <div className="flex items-center gap-2 text-xs text-red-400 mt-1 mb-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.categoryId}</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300 transform-gpu',
                  categoryId === cat.id
                    ? 'border-accent/80 bg-accent/10 shadow-[0_0_0_1px_rgba(57,255,20,0.2),0_18px_40px_-24px_rgba(57,255,20,0.65)] scale-[1.01]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5'
                )}
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl transition-all duration-300', categoryId === cat.id ? 'border-accent/40 bg-black/20' : 'border-white/10 bg-black/15')}>
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-white">{cat.name}</span>
                    {categoryId === cat.id && <CheckCircle2 className="h-4 w-4 text-accent" />}
                  </div>
                  <p className="mt-1 text-sm font-light text-white/45">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
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
            Next: Item Details
          </button>
        </div>
      )}
    </div>
  );
}
