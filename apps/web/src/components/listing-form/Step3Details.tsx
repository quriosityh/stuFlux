'use client';

import { useState, useEffect } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BadgeInfo, Plus, X, AlertCircle } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step3Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

const CONDITIONS = ['New', 'Like new', 'Used', 'Damaged'] as const;

export function Step3Details({ data, updateData, onNext, onBack, hideFooter }: Step3Props) {
  const [description, setDescription] = useState(data.description || '');
  const [condition, setCondition] = useState<ListingFormData['condition']>(data.condition);
  const [specs, setSpecs] = useState<Record<string, string>>(data.specs || {});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; condition?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isValid = description.trim().length > 0 && condition !== undefined;

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const newErrors: typeof errors = {};
      if (!description.trim()) {
        newErrors.description = 'Description is required.';
      }
      if (!condition) {
        newErrors.condition = 'Condition is required.';
      }
      setErrors(newErrors);
    }
  }, [description, condition, hasAttemptedSubmit]);

  // Handle Enter key on specs input or general inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // If we are currently entering a spec, do not advance step; let the spec add
        if (isAddingSpec) return;
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.tagName === 'SELECT')) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [description, condition, specs, isAddingSpec]);

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs({ ...specs, [newSpecKey.trim()]: newSpecValue.trim() });
      setNewSpecKey('');
      setNewSpecValue('');
      setIsAddingSpec(false);
    }
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    const next = { ...specs };
    delete next[keyToRemove];
    setSpecs(next);
  };

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    const newErrors: typeof errors = {};
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!condition) {
      newErrors.condition = 'Condition is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateData({ description, condition, specs });
    onNext();
  };

  const conditionDescriptions: Record<string, string> = {
    New: 'Unused and untouched.',
    'Like new': 'Near-perfect condition.',
    Used: 'Clean and well cared for.',
    Damaged: 'Visible wear, still usable.',
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <BadgeInfo className="h-3.5 w-3.5 text-accent" />
          Step 3 of 5
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Details</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">
          Describe the item's state, select its condition, and optionally list exact specs.
        </p>
      </div>

      <div className="space-y-8">
        {/* Description Field */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
            Description <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
          </label>
          <div className={cn(
            'rounded-[1.5rem] border bg-[#14141E] px-4 py-4 transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50',
            errors.description ? 'border-red-500/50 focus-within:border-red-500/70 focus-within:ring-red-500/50' : 'border-white/10'
          )}>
            <textarea
              placeholder="A quick story, what’s included, and anything renters should know."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/25"
            />
            <div className="mt-2 flex justify-end text-[11px] uppercase tracking-[0.3em] text-white/28">{description.length}/1000</div>
          </div>
          {errors.description && (
            <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.description}</span>
            </div>
          )}
        </div>

        {/* Condition Field */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
            Condition <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
          </label>
          {errors.condition && (
            <div className="flex items-center gap-2 text-xs text-red-400 mt-1 mb-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.condition}</span>
            </div>
          )}
          <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-4">
            {CONDITIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCondition(option)}
                className={cn(
                  'flex flex-col items-center justify-center py-4 px-2 rounded-2xl border text-center transition-all duration-300 transform-gpu',
                  condition === option
                    ? 'border-emerald-400/60 bg-emerald-400/10 shadow-sm scale-[1.03]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                )}
              >
                <div className="font-display text-sm font-bold text-white">{option}</div>
                <p className="mt-1 text-[10px] font-light text-white/45 leading-tight">{conditionDescriptions[option]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Specs Field (Optional) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">Specifications (Optional)</label>
            {!isAddingSpec && (
              <button type="button" onClick={() => setIsAddingSpec(true)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-accent transition-colors hover:opacity-80">
                <Plus className="h-3.5 w-3.5" /> Add Spec
              </button>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4 min-h-[80px]">
            <div className="flex flex-wrap gap-3">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
                  <span className="text-white/45">{key}:</span>
                  <span className="font-semibold">{value}</span>
                  <button type="button" onClick={() => handleRemoveSpec(key)} className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-white/45 transition-colors hover:bg-red-500/15 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {Object.keys(specs).length === 0 && !isAddingSpec && (
                <div className="flex items-center justify-center w-full h-full text-sm font-light italic text-white/28">
                  e.g. Brand: Sony, Model: A7 III, Color: Black
                </div>
              )}
            </div>

            {isAddingSpec && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  placeholder="Label (e.g. Brand)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Sony)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAddingSpec(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5">Cancel</button>
                  <button type="button" onClick={handleAddSpec} disabled={!newSpecKey.trim() || !newSpecValue.trim()} className="rounded-xl px-3 py-2 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 liquid-button active:scale-95 transform-gpu">
                    Add
                  </button>
                </div>
              </div>
            )}
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
            Next: Logistics
          </button>
        </div>
      )}
    </div>
  );
}
