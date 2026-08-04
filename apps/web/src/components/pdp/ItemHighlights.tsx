import { Truck, CalendarDays, ShieldAlert, ScrollText } from 'lucide-react';

interface ItemHighlightsProps {
  deliveryAvailable: boolean;
  minRentalDays: number;
  securityDeposit: number;
  rentalRules?: string | null;
  area?: string | null;
}

export function ItemHighlights({ deliveryAvailable, minRentalDays, securityDeposit, rentalRules, area }: ItemHighlightsProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-border/5 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-foreground/80" />
        </div>
        <div className="pt-1">
          <h4 className="font-semibold text-sm font-syne">
            {deliveryAvailable ? 'Delivery available' : 'Pickup only'}
          </h4>
          <p className="text-xs text-foreground/60 mt-0.5">
            {deliveryAvailable
              ? `Lender can deliver this item to you for an extra fee.${ area ? ` Pickup location: ${area}.` : '' }`
              : `You will need to pick this item up from the lender.${ area ? ` Location: ${area}.` : '' }`}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-border/5 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-foreground/80" />
        </div>
        <div className="pt-1">
          <h4 className="font-semibold text-sm font-syne">
            Minimum {minRentalDays} day{minRentalDays !== 1 && 's'} rental
          </h4>
          <p className="text-xs text-foreground/60 mt-0.5">
            This item cannot be rented for less than {minRentalDays} day{minRentalDays !== 1 && 's'}.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-border/5 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-foreground/80" />
        </div>
        <div className="pt-1">
          <h4 className="font-semibold text-sm font-syne">
            {securityDeposit > 0 ? `Rs. ${securityDeposit.toLocaleString()} security deposit` : 'No security deposit'}
          </h4>
          <p className="text-xs text-foreground/60 mt-0.5">
            {securityDeposit > 0 ? 'Fully refundable upon safe return of the item.' : 'Rent with peace of mind.'}
          </p>
        </div>
      </div>

      {/* Owner's rental rules — only shown when the lender has set them */}
      {rentalRules && rentalRules.trim() && (
        <div className="flex items-start gap-4 mt-1">
          <div className="w-10 h-10 rounded-full bg-amber-500/8 flex items-center justify-center shrink-0">
            <ScrollText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="pt-1">
            <h4 className="font-semibold text-sm font-syne text-foreground">Owner's Rental Rules</h4>
            <div className="mt-1.5 space-y-1">
              {rentalRules
                .split(/\n|•|-(?=\s)/)  // split on newlines or bullet characters
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i} className="text-xs text-foreground/70 leading-relaxed flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    {line}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
