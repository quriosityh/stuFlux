import { ListingFormData } from '../types';

type Step4PricingTermsProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step4PricingTerms({ data, updateData, onNext, onBack }: Step4PricingTermsProps) {
  const isValid = data.daily_rate > 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Set your price & terms</h2>
        <p className="text-foreground/50 text-sm">
          Decide how much you want to charge and any rules for renters.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
              Daily Rate <span className="text-accent">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-foreground/50 font-medium">Rs.</span>
              <input
                type="number"
                min="0"
                value={data.daily_rate || ''}
                onChange={(e) => updateData({ daily_rate: Number(e.target.value) })}
                className="w-full bg-surface/50 border border-border/50 text-foreground rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              <span className="absolute right-4 text-foreground/50 font-medium">/day</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider flex items-center gap-2">
              Security Deposit
              <span className="text-[10px] bg-border/50 text-foreground/60 px-2 py-0.5 rounded-full normal-case tracking-normal">Optional</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-foreground/50 font-medium">Rs.</span>
              <input
                type="number"
                min="0"
                value={data.security_deposit || ''}
                onChange={(e) => updateData({ security_deposit: Number(e.target.value) })}
                className="w-full bg-surface/50 border border-border/50 text-foreground rounded-xl pl-12 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
            Rental Duration
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="block text-xs text-foreground/50 mb-1">Minimum days</span>
              <input
                type="number"
                min="1"
                value={data.min_rental_days}
                onChange={(e) => updateData({ min_rental_days: Number(e.target.value) })}
                className="w-full bg-surface/50 border border-border/50 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <span className="text-foreground/30 pt-4">—</span>
            <div className="flex-1">
              <span className="block text-xs text-foreground/50 mb-1">Maximum days</span>
              <input
                type="number"
                min={data.min_rental_days}
                value={data.max_rental_days}
                onChange={(e) => updateData({ max_rental_days: Number(e.target.value) })}
                className="w-full bg-surface/50 border border-border/50 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-surface/50 border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold mb-1">I can deliver</h3>
              <p className="text-foreground/50 text-sm">Offer delivery for an extra fee</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={data.delivery_available}
                onChange={(e) => updateData({ delivery_available: e.target.checked })}
              />
              <div className="w-11 h-6 bg-border/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {data.delivery_available && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
                Delivery Fee (Round trip)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-foreground/50 font-medium">Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={data.delivery_fee || ''}
                  onChange={(e) => updateData({ delivery_fee: Number(e.target.value) })}
                  className="w-full bg-background border border-border/50 text-foreground rounded-xl pl-12 py-3 focus:outline-none focus:border-accent transition-colors"
                  placeholder="200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider flex items-center gap-2">
            Rental Rules
            <span className="text-[10px] bg-border/50 text-foreground/60 px-2 py-0.5 rounded-full normal-case tracking-normal">Optional</span>
          </label>
          <div className="relative">
            <textarea
              value={data.rental_rules}
              onChange={(e) => updateData({ rental_rules: e.target.value })}
              placeholder="e.g. Please handle with care, do not wash the item, return cleaned..."
              className="w-full h-24 bg-surface/50 border border-border/50 text-foreground placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              maxLength={1000}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border/50 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="hyper-liquid px-8 py-3 font-bold text-sm text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
