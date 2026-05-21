import { Truck, CalendarDays, ShieldAlert } from 'lucide-react';

interface ItemHighlightsProps {
  deliveryAvailable: boolean;
  minRentalDays: number;
  securityDeposit: number;
}

export function ItemHighlights({ deliveryAvailable, minRentalDays, securityDeposit }: ItemHighlightsProps) {
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
            {deliveryAvailable ? 'Lender can deliver this item to you for an extra fee.' : 'You will need to pick this item up from the lender.'}
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
    </div>
  );
}
