import { ActivityBooking } from './types';

interface EarningsSummaryProps {
  bookings: ActivityBooking[];
}

/** Tiny inline SVG sparkline rendered behind the lifetime‑earned value */
function Sparkline() {
  // A gentle upward trend — purely decorative
  const points = '0,28 15,24 30,26 45,18 60,20 75,12 90,14 105,6 120,8';
  return (
    <svg
      className="absolute bottom-0 right-0 w-[120px] h-[36px] opacity-20 pointer-events-none"
      viewBox="0 0 120 36"
      fill="none"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-400"
      />
      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
      <polygon
        points={`0,36 ${points} 120,36`}
        fill="url(#sparkFill)"
        className="text-emerald-400"
      />
    </svg>
  );
}

export default function EarningsSummary({ bookings }: EarningsSummaryProps) {
  const confirmedOrCompleted = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  
  const totalEarned = confirmedOrCompleted.reduce((acc, b) => acc + b.total_amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthEarned = confirmedOrCompleted.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, b) => acc + b.total_amount, 0);

  const uniqueItems = new Set(confirmedOrCompleted.map(b => b.listing_id)).size;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
      {/* Lifetime Earned — hero card with sparkline */}
      <div className="relative flex flex-col bg-foreground/5 rounded-[8px] px-[16px] py-[14px] overflow-hidden">
        <span className="text-[11px] uppercase text-foreground/40 font-medium mb-1 tracking-[0.06em]">Lifetime Earned</span>
        <span className="text-[32px] font-medium text-emerald-500 leading-tight">
          {formatCurrency(totalEarned)}
        </span>
        <Sparkline />
      </div>

      {/* This Month */}
      <div className="flex flex-col bg-foreground/5 rounded-[8px] px-[16px] py-[14px]">
        <span className="text-[11px] uppercase text-foreground/40 font-medium mb-1 tracking-[0.06em]">This Month</span>
        <span className="text-[20px] font-medium text-emerald-500">
          {formatCurrency(thisMonthEarned)}
        </span>
      </div>

      {/* Items Rented */}
      <div className="flex flex-col bg-foreground/5 rounded-[8px] px-[16px] py-[14px]">
        <span className="text-[11px] uppercase text-foreground/40 font-medium mb-1 tracking-[0.06em]">Items Rented</span>
        <span className="text-[20px] font-medium text-foreground">
          {uniqueItems}
        </span>
      </div>
    </div>
  );
}
