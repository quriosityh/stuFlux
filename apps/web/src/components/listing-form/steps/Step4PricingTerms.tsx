'use client';

import { useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { ListingFormData } from '../types';

type Step4PricingTermsProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onValidChange?: (valid: boolean) => void;
};

function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  const decrement = () => {
    const next = value - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const increment = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div className="flex items-center w-full bg-surface/40 border border-border/30 rounded-xl overflow-hidden focus-within:border-accent/60 focus-within:bg-surface/60 transition-all duration-200">
      <button
        type="button"
        onClick={decrement}
        disabled={min !== undefined && value <= min}
        className="flex-shrink-0 w-11 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-border/20 transition-colors border-r border-border/20 disabled:opacity-20 disabled:cursor-not-allowed py-3"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 flex items-center justify-center gap-1 px-2">
        {prefix && <span className="text-foreground/35 text-xs font-medium flex-shrink-0">{prefix}</span>}
        <input
          type="number"
          value={value || ''}
          min={min}
          max={max}
          placeholder={placeholder ?? '0'}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (min !== undefined && val < min) return;
            if (max !== undefined && val > max) return;
            onChange(val);
          }}
          className="w-full bg-transparent text-foreground text-center text-sm font-semibold outline-none border-none py-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-foreground/35 text-xs font-medium flex-shrink-0">{suffix}</span>}
      </div>

      <button
        type="button"
        onClick={increment}
        disabled={max !== undefined && value >= max}
        className="flex-shrink-0 w-11 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-border/20 transition-colors border-l border-border/20 disabled:opacity-20 disabled:cursor-not-allowed py-3"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-semibold text-foreground/35 uppercase tracking-[0.18em] mb-2">
      {children}
    </span>
  );
}

export function Step4PricingTerms({ data, updateData, onValidChange }: Step4PricingTermsProps) {
  const isValid = data.daily_rate > 0;

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-4xl font-display font-bold text-foreground mb-1.5 text-center lg:text-left">Set your price &amp; terms</h2>
        <p className="text-foreground/40 text-sm">Decide how much to charge and any rules for renters.</p>
      </div>

      <div className="flex-1 flex flex-col gap-7">

        {/* ── Pricing ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Daily Rate <span className="text-red-500">*</span></FieldLabel>
            <NumberStepper
              value={data.daily_rate}
              onChange={(v) => updateData({ daily_rate: v })}
              min={0}
              step={50}
              prefix="Rs."
              suffix="/day"
              placeholder="500"
            />
          </div>
          <div>
            <FieldLabel>Security Deposit <span className="text-foreground/25 normal-case tracking-normal text-[9px]">optional</span></FieldLabel>
            <NumberStepper
              value={data.security_deposit}
              onChange={(v) => updateData({ security_deposit: v })}
              min={0}
              step={100}
              prefix="Rs."
              placeholder="0"
            />
          </div>
        </div>

        {/* ── Divider ─── */}
        <div className="h-px bg-border/20" />

        {/* ── Duration + Delivery ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Duration */}
          <div>
            <FieldLabel>Rental Duration <span className="text-red-500">*</span></FieldLabel>
            <div className="flex flex-row gap-2.5 lg:flex-col">
            <div className="flex-1">
                <span className="block text-[10px] text-foreground/30 mb-1.5">Min days</span>
                <NumberStepper
                  value={data.min_rental_days ?? 1}
                  onChange={(v) => updateData({ min_rental_days: v })}
                  min={1}
                  max={data.max_rental_days ?? 30}
                  step={1}
                  suffix="day"
                />
              </div>
            <div className="flex-1">
                <span className="block text-[10px] text-foreground/30 mb-1.5">Max days</span>
                <NumberStepper
                  value={data.max_rental_days}
                  onChange={(v) => updateData({ max_rental_days: v })}
                  min={data.min_rental_days ?? 1}
                  step={1}
                  suffix="days"
                />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div>
            <FieldLabel>Delivery</FieldLabel>
            {/* Spacer to align card with Min days stepper */}
            <div className="h-[22px]" />
            <div className="bg-surface/40 border border-border/30 rounded-xl p-4 flex flex-col gap-3 h-fit">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70 font-medium">Offer delivery</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={data.delivery_available}
                    onChange={(e) => updateData({ delivery_available: e.target.checked })}
                  />
                  <div className="w-10 h-5 bg-border/50 rounded-full peer peer-checked:bg-accent transition-colors duration-300" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 peer-checked:translate-x-5" />
                </label>
              </div>

              {data.delivery_available ? (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="block text-[10px] text-foreground/30 mb-1.5">Fee (round trip)</span>
                  <NumberStepper
                    value={data.delivery_fee}
                    onChange={(v) => updateData({ delivery_fee: v })}
                    min={0}
                    step={50}
                    prefix="Rs."
                    placeholder="200"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-foreground/25">Renters pick up &amp; drop off themselves.</p>
              )}
            </div>
          </div>

        </div>

        {/* ── Divider ─── */}
        <div className="h-px bg-border/20" />

        {/* ── Rules ─── */}
        <div>
          <FieldLabel>Rental Rules <span className="text-foreground/25 normal-case tracking-normal text-[9px]">optional</span></FieldLabel>
          <div className="relative">
            <textarea
              value={data.rental_rules}
              onChange={(e) => updateData({ rental_rules: e.target.value })}
              placeholder="e.g. Handle with care, no washing, return cleaned…"
              className="w-full h-24 bg-surface/40 border border-border/30 text-foreground placeholder-foreground/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/60 focus:bg-surface/60 transition-all resize-none"
              maxLength={1000}
            />
            <span className="absolute right-3 bottom-3 text-[10px] font-mono text-foreground/25">
              {data.rental_rules?.length ?? 0}/1000
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
