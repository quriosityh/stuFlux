import { useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export function Step3Availability({ data, updateData, onNext, onBack, hideFooter }: Step3Props) {
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

  const inputBase = 'w-full bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200';
  const numInputBase = 'flex-grow bg-transparent border-none outline-none px-4 py-3 text-white placeholder:text-white/30 font-display text-base focus:ring-0';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="flex flex-col items-center text-center space-y-2 mt-2 mb-8">
        <div className="text-accent font-semibold text-[10px] sm:text-xs tracking-widest uppercase">Step 3 of 4</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">Logistics & Availability</h2>
        <p className="text-white/50 text-xs sm:text-sm max-w-sm">Set location, rental duration rules and optional deposit.</p>
      </div>

      <div className="space-y-6">

        {/* Location */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Location</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-white/40 pl-1">City <span className="text-red-400">*</span></p>
              <input
                type="text"
                placeholder="e.g. Lahore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 pl-1">Area <span className="text-white/30">(optional)</span></p>
              <input
                type="text"
                placeholder="e.g. Gulberg III"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputBase}
              />
            </div>
          </div>
        </div>

        {/* Rental Duration */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Rental Duration</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-white/40 pl-1">Minimum Days</p>
              <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl flex items-center overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-200">
                <input type="number" min="1" value={minDays} onChange={(e) => setMinDays(e.target.value)} className={numInputBase} />
                <span className="pr-4 text-foreground/40 text-sm font-medium">days</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 pl-1">Maximum Days</p>
              <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl flex items-center overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-200">
                <input type="number" min={minDays} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} className={numInputBase} />
                <span className="pr-4 text-foreground/40 text-sm font-medium">days</span>
              </div>
            </div>
          </div>
          {Number(maxDays) < Number(minDays) && (
            <p className="text-red-400 text-xs pl-1">Max days must be ≥ min days.</p>
          )}
        </div>

        {/* Security Deposit */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">
            Security Deposit <span className="normal-case text-white/30 font-normal">(optional, refundable)</span>
          </label>
          <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl flex items-stretch w-full md:w-64 overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-200">
            <div className="flex items-center justify-center bg-[#1A1A2A] border-r border-[#2A2A35] px-4 font-bold text-accent text-sm">PKR</div>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none px-4 py-3 text-foreground placeholder:text-foreground/30 text-base focus:ring-0"
            />
          </div>
          <p className="text-xs text-foreground/40 pl-1">Amount held to cover any damages. Returned after safe return.</p>
        </div>

        {/* Delivery Toggle */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Delivery</label>
          <div className="bg-[#161622] border border-[#2A2A35] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Offer delivery to renter?</p>
                <p className="text-xs text-white/50 mt-0.5">You can deliver the item to them for a fee.</p>
              </div>
              <button
                onClick={() => setDeliveryAvailable(!deliveryAvailable)}
                className="relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
                style={{ backgroundColor: deliveryAvailable ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow',
                  deliveryAvailable ? 'translate-x-7' : 'translate-x-1'
                )} />
              </button>
            </div>

            {deliveryAvailable && (
              <div className="mt-4 pt-4 border-t border-[#2A2A35] animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-white/50 mb-2">Delivery fee (PKR)</p>
                <div className="bg-[#1A1A2A] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl flex items-stretch w-full md:w-48 overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-200">
                  <div className="flex items-center justify-center bg-[#161622] border-r border-[#2A2A35] px-4 font-bold text-accent text-sm">PKR</div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none px-4 py-2.5 text-foreground placeholder:text-foreground/30 text-base focus:ring-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hidden trigger for card footer */}
      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-between">
          <button onClick={onBack} className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5">
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={cn('px-8 py-3 rounded-full font-bold transition-all duration-300', isValid ? 'liquid-button' : 'glass-spotlight opacity-50 cursor-not-allowed')}
          >
            Next: Photos
          </button>
        </div>
      )}
    </div>
  );
}
