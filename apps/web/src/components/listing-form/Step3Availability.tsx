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
};

export function Step3Availability({ data, updateData, onNext, onBack }: Step3Props) {
  const [city, setCity] = useState(data.city || '');
  const [address, setAddress] = useState(data.address || '');
  const [minDays, setMinDays] = useState<string>(data.min_rental_days ? String(data.min_rental_days) : '1');
  const [maxDays, setMaxDays] = useState<string>(data.max_rental_days ? String(data.max_rental_days) : '30');
  const [deliveryAvailable, setDeliveryAvailable] = useState(data.delivery_available || false);
  const [deliveryFee, setDeliveryFee] = useState<string>(data.delivery_fee ? String(data.delivery_fee) : '0');
  const [securityDeposit, setSecurityDeposit] = useState<string>(data.security_deposit ? String(data.security_deposit) : '0');

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
        security_deposit: Number(securityDeposit)
      });
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Logistics & Availability</h2>
        <p className="text-foreground/70">Set your rules for location, rental durations, and deposits.</p>
      </div>

      <div className="space-y-8">
        
        {/* Location Box */}
        <div className="chrome-card rounded-2xl p-6 space-y-5 relative">
          <h3 className="font-display font-bold text-lg border-b border-border/50 pb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">City</label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30">
                <input 
                  type="text"
                  placeholder="e.g. Lahore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:ring-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Specific Area/Address <span className="normal-case text-foreground/50 font-normal">(Optional)</span></label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30">
                <input 
                  type="text"
                  placeholder="e.g. Gulberg III"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Box */}
        <div className="chrome-card rounded-2xl p-6 space-y-5">
          <h3 className="font-display font-bold text-lg border-b border-border/50 pb-2">Rental Duration Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Minimum Days</label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30 flex items-center pr-4">
                <input 
                  type="number"
                  min="1"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground font-display text-lg focus:ring-0"
                />
                <span className="text-foreground/50 font-medium">days</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Maximum Days</label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30 flex items-center pr-4">
                <input 
                  type="number"
                  min={minDays}
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground font-display text-lg focus:ring-0"
                />
                <span className="text-foreground/50 font-medium">days</span>
              </div>
            </div>
          </div>
          {Number(maxDays) < Number(minDays) && (
             <p className="text-red-400 text-sm mt-1">Maximum days must be greater than or equal to minimum days.</p>
          )}
        </div>

        {/* Finances & Delivery Box */}
        <div className="chrome-card rounded-2xl p-6 space-y-5">
          <h3 className="font-display font-bold text-lg border-b border-border/50 pb-2">Delivery & Deposits</h3>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-foreground">Offer Delivery?</p>
              <p className="text-sm text-foreground/60">Can you deliver the item to the renter?</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setDeliveryAvailable(!deliveryAvailable)}
              className={cn(
                "w-14 h-8 rounded-full p-1 transition-colors duration-300 relative flex items-center",
                !deliveryAvailable && "bg-foreground/20"
              )}
              style={{ backgroundColor: deliveryAvailable ? 'var(--accent)' : undefined }}
            >
              <div className={cn(
                "w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md",
                deliveryAvailable ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-500 overflow-hidden",
            deliveryAvailable ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0 m-0 border-none"
          )}>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Delivery Fee (PKR)</label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30 flex items-center pl-4">
                <span className="text-accent font-bold">PKR</span>
                <input 
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground font-display text-lg focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/30">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Security Deposit (PKR) <span className="normal-case text-foreground/50 font-normal">(Refundable)</span></label>
              <div className="bg-background/50 rounded-xl p-1 border border-border/30 flex items-center pl-4 md:w-1/2">
                <span className="text-accent font-bold">PKR</span>
                <input 
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground font-display text-lg focus:ring-0"
                />
              </div>
              <p className="text-xs text-foreground/50 pl-2">Amount you hold in case of damages (optional but recommended).</p>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5"
        >
          ← Back
        </button>
        <button 
          onClick={handleNext}
          disabled={!isValid}
          className={cn(
            "px-8 py-3 rounded-full font-bold transition-all duration-300",
            isValid 
              ? "liquid-button" 
              : "glass-spotlight opacity-50 cursor-not-allowed"
          )}
        >
          Next: Photos
        </button>
      </div>
    </div>
  );
}
