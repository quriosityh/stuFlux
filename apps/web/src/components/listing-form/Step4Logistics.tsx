'use client';

import { useState, useEffect } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Landmark, ShieldCheck, Truck, AlertCircle, FileText } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step4Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

export function Step4Logistics({ data, updateData, onNext, onBack, hideFooter }: Step4Props) {
  const [dailyRate, setDailyRate] = useState<string>(data.daily_rate ? String(data.daily_rate) : '');
  const [minDays, setMinDays] = useState<string>(data.min_rental_days ? String(data.min_rental_days) : '1');
  const [maxDays, setMaxDays] = useState<string>(data.max_rental_days ? String(data.max_rental_days) : '30');
  const [deliveryAvailable, setDeliveryAvailable] = useState(data.delivery_available || false);
  const [deliveryFee, setDeliveryFee] = useState<string>(data.delivery_fee ? String(data.delivery_fee) : '');
  const [securityDeposit, setSecurityDeposit] = useState<string>(data.security_deposit ? String(data.security_deposit) : '');
  const [rules, setRules] = useState(data.rules || '');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isValid = dailyRate !== '' && Number(dailyRate) > 0 && 
                  minDays !== '' && Number(minDays) > 0 && 
                  maxDays !== '' && Number(maxDays) >= Number(minDays);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const newErrors: Record<string, string> = {};
      if (!dailyRate || Number(dailyRate) <= 0) {
        newErrors.dailyRate = 'Price per day must be greater than 0.';
      }
      if (!minDays || Number(minDays) <= 0) {
        newErrors.minDays = 'Minimum rental duration must be at least 1 day.';
      }
      if (!maxDays || Number(maxDays) <= 0) {
        newErrors.maxDays = 'Maximum rental duration must be at least 1 day.';
      } else if (Number(maxDays) < Number(minDays)) {
        newErrors.maxDays = 'Maximum rental days cannot be less than minimum rental days.';
      }
      if (deliveryAvailable && (!deliveryFee || Number(deliveryFee) < 0)) {
        newErrors.deliveryFee = 'Delivery fee must be a valid number.';
      }
      setErrors(newErrors);
    }
  }, [dailyRate, minDays, maxDays, deliveryAvailable, deliveryFee, hasAttemptedSubmit]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
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
  }, [dailyRate, minDays, maxDays, deliveryAvailable, deliveryFee, securityDeposit, rules]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    const newErrors: Record<string, string> = {};
    if (!dailyRate || Number(dailyRate) <= 0) {
      newErrors.dailyRate = 'Price per day must be greater than 0.';
    }
    if (!minDays || Number(minDays) <= 0) {
      newErrors.minDays = 'Minimum rental duration must be at least 1 day.';
    }
    if (!maxDays || Number(maxDays) <= 0) {
      newErrors.maxDays = 'Maximum rental duration must be at least 1 day.';
    } else if (Number(maxDays) < Number(minDays)) {
      newErrors.maxDays = 'Maximum rental days cannot be less than minimum rental days.';
    }
    if (deliveryAvailable && (!deliveryFee || Number(deliveryFee) < 0)) {
      newErrors.deliveryFee = 'Delivery fee must be a valid number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateData({
      daily_rate: Number(dailyRate),
      min_rental_days: Number(minDays),
      max_rental_days: Number(maxDays),
      delivery_available: deliveryAvailable,
      delivery_fee: deliveryAvailable ? Number(deliveryFee) : 0,
      security_deposit: securityDeposit ? Number(securityDeposit) : 0,
      rules: rules.trim() || undefined
    });
    onNext();
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <Landmark className="h-3.5 w-3.5 text-accent" />
          Step 4 of 5
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Pricing &amp; Logistics</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">
          Set your rental rules, prices, and pickup/delivery options in one place.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Price Per Day */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
              Price per day <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
            </label>
            <div className={cn(
              'rounded-[1.5rem] border bg-[#14141E] p-3 transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50',
              errors.dailyRate ? 'border-red-500/50' : 'border-white/10'
            )}>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="flex h-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 px-3 text-xs font-bold tracking-widest text-accent">PKR</div>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full border-none bg-transparent font-display text-xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-white/35">/day</span>
              </div>
            </div>
            {errors.dailyRate && (
              <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.dailyRate}</span>
              </div>
            )}
          </div>

          {/* Refundable Deposit */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">Refundable Deposit</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-3 transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="flex h-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 px-3 text-xs font-bold tracking-widest text-accent">PKR</div>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="w-full border-none bg-transparent font-display text-xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">Refundable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Duration */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">
              Duration Limits <span className="text-red-500 font-extrabold ml-1 text-base sm:text-lg">*</span>
            </label>
            <div className={cn(
              'grid gap-3 rounded-[1.5rem] border bg-[#14141E] p-4 sm:grid-cols-2',
              errors.minDays || errors.maxDays ? 'border-red-500/50' : 'border-white/10'
            )}>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Min days</p>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 transition-all duration-300 focus-within:border-accent/70">
                  <input type="number" min="1" value={minDays} onChange={(e) => setMinDays(e.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Max days</p>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 transition-all duration-300 focus-within:border-accent/70">
                  <input type="number" min={minDays} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                </div>
              </div>
            </div>
            {(errors.minDays || errors.maxDays) && (
              <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.maxDays || errors.minDays}</span>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">Delivery</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4 min-h-[105px] flex flex-col justify-center">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-display text-sm font-bold text-white">Offer delivery?</p>
                  <p className="text-[11px] font-light text-white/45">Set a fee if you drop it off yourself.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryAvailable(!deliveryAvailable)}
                  className="relative h-6 w-12 flex-shrink-0 rounded-full transition-all duration-300"
                  style={{ backgroundColor: deliveryAvailable ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}
                >
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow', deliveryAvailable ? 'translate-x-6' : 'translate-x-0.5')} />
                </button>
              </div>

              {deliveryAvailable && (
                <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 focus-within:border-accent/70">
                    <div className="flex h-8 items-center justify-center rounded-md border border-accent/20 bg-accent/10 px-2 text-[10px] font-bold tracking-[0.3em] text-accent">PKR</div>
                    <input type="number" min="0" placeholder="Delivery Fee" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="flex-1 border-none bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
                  </div>
                  {errors.deliveryFee && (
                    <div className="flex items-center gap-1.5 text-[10px] text-red-400 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.deliveryFee}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rules & Guidelines */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/85">Rental Rules / Guidelines (Optional)</label>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] px-4 py-3 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-300">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-white/30 mt-1 shrink-0" />
              <textarea
                placeholder="e.g. Return in original box. Clean the item before returning. No outdoor use."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                maxLength={400}
                rows={2}
                className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/25"
              />
            </div>
            <div className="mt-1 flex justify-end text-[10px] uppercase tracking-[0.3em] text-white/28">{rules.length}/400</div>
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
            Next: Location
          </button>
        </div>
      )}
    </div>
  );
}
