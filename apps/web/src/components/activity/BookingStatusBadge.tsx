import { cn } from '@/lib/utils';

export type DisplayStatus = 'active' | 'upcoming' | 'pending' | 'completed' | 'declined';

export default function BookingStatusBadge({ status }: { status: DisplayStatus }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      case 'declined':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      case 'completed':
        return 'bg-white/5 text-zinc-400 border-white/10';
      default:
        return 'bg-white/5 text-zinc-400 border-white/10';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'pending': return 'Pending';
      case 'declined': return 'Declined';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <span 
      className={cn(
        'px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider flex items-center gap-1.5',
        getStatusStyles()
      )}
    >
      {status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
      {status === 'upcoming' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
      {getStatusLabel()}
    </span>
  );
}
