import { ActivityBooking } from './types';

interface EarningsSummaryProps {
  bookings: ActivityBooking[];
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
  <div className="relative bg-[#0A0A0A] bg-opacity-80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-8">
    {/* Neon accent border */}
    <div className="absolute inset-0 rounded-2xl border-2 border-accent/60 pointer-events-none" />
    {/* Sleek metallic top border */}
    <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
    <div className="p-4 relative z-10">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <span>Total Earnings</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <div className="flex flex-col justify-center pb-4 md:pb-0 md:pr-6">
          <span className="text-sm text-zinc-400 font-medium mb-1">Lifetime Earned</span>
          <span className="font-display text-4xl font-bold text-white tracking-tight animate-pulse">
            {formatCurrency(totalEarned)}
          </span>
        </div>
        <div className="flex flex-col justify-center py-4 md:py-0 md:px-6">
          <span className="text-sm text-zinc-400 font-medium mb-1">This Month</span>
          <span className="font-display text-2xl font-semibold text-zinc-200">{formatCurrency(thisMonthEarned)}</span>
        </div>
        <div className="flex flex-col justify-center pt-4 md:pt-0 md:pl-6">
          <span className="text-sm text-zinc-400 font-medium mb-1">Items Rented</span>
          <span className="font-display text-2xl font-semibold text-zinc-200">
            {uniqueItems}
          </span>
        </div>
      </div>
    </div>
  </div>
  );
}
