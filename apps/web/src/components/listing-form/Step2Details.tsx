import { useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapPin, ShieldCheck, Truck } from 'lucide-react';

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

export function Step2Details({ data, updateData, onNext, onBack, hideFooter }: Step2Props) {
  const [city, setCity] = useState(data.city || '');
  const [address, setAddress] = useState(data.address || '');
  const [minDays, setMinDays] = useState<string>(data.min_rental_days ? String(data.min_rental_days) : '1');
  const [maxDays, setMaxDays] = useState<string>(data.max_rental_days ? String(data.max_rental_days) : '30');
  const [deliveryAvailable, setDeliveryAvailable] = useState(data.delivery_available || false);
  const [deliveryFee, setDeliveryFee] = useState<string>(data.delivery_fee ? String(data.delivery_fee) : '');
  const [securityDeposit, setSecurityDeposit] = useState<string>(data.security_deposit ? String(data.security_deposit) : '');

  const isValid = city.trim().length > 0 && Number(minDays) > 0 && Number(maxDays) >= Number(minDays);

  const handleNext = () => {
    if (isValid) {
      updateData({
        city,
        address,
        min_rental_days: Number(minDays),
        max_rental_days: Number(maxDays),
        delivery_available: deliveryAvailable,
        delivery_fee: deliveryAvailable ? Number(deliveryFee) : 0,
        security_deposit: securityDeposit ? Number(securityDeposit) : 0,
      });
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          Step 2 of 4
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Make the logistics feel effortless</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">Use this step to set where the item lives, how long it can be rented, and whether delivery exists at all.</p>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Location</label>
            <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">City</p>
                <input type="text" placeholder="e.g. Lahore" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Area <span className="text-white/20">(optional)</span></p>
                <input type="text" placeholder="e.g. Gulberg III" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Duration</label>
            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Min days</p>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-all duration-300 focus-within:border-accent/70">
                  <input type="number" min="1" value={minDays} onChange={(e) => setMinDays(e.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Max days</p>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-all duration-300 focus-within:border-accent/70">
                  <input type="number" min={minDays} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                </div>
              </div>
              {Number(maxDays) < Number(minDays) && <p className="text-xs text-red-300 sm:col-span-2">Max days must be at least the minimum days.</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Deposit</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4">
              <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 focus-within:border-accent/70">
                <div className="flex h-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 px-3 text-xs font-bold tracking-[0.3em] text-accent">PKR</div>
                <input type="number" min="0" placeholder="0" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} className="flex-1 border-none bg-transparent font-display text-xl font-bold text-white outline-none placeholder:text-white/20" />
              </div>
              <p className="mt-3 text-xs font-light text-white/35">Optional refundable deposit, shown clearly in the review step.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Delivery</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-display text-base font-bold text-white">Offer delivery to renter?</p>
                  <p className="text-sm font-light text-white/45">Set a fee if you are willing to drop the item off yourself.</p>
                </div>
                <button
                  onClick={() => setDeliveryAvailable(!deliveryAvailable)}
                  className="relative h-7 w-14 flex-shrink-0 rounded-full transition-all duration-300"
                  style={{ backgroundColor: deliveryAvailable ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}
                >
                  <div className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow', deliveryAvailable ? 'translate-x-7' : 'translate-x-1')} />
                </button>
              </div>

              {deliveryAvailable && (
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Delivery fee</p>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 focus-within:border-accent/70">
                    <div className="flex h-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 px-3 text-xs font-bold tracking-[0.3em] text-accent">PKR</div>
                    <input type="number" min="0" placeholder="0" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2"><ShieldCheck className="h-4 w-4 text-accent" /> Clear location</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2"><Truck className="h-4 w-4 text-accent" /> Delivery optional</span>
          </div>
        </div>
      </div>

      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-between">
          <button onClick={onBack} className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5">
            ← Back
          </button>
          <button onClick={handleNext} disabled={!isValid} className={cn('px-8 py-3 rounded-full font-bold transition-all duration-300 active:scale-95 transform-gpu', isValid ? 'liquid-button' : 'glass-spotlight opacity-50 cursor-not-allowed')}>
            Next: Photos
          </button>
        </div>
      )}
    </div>
  );
}
