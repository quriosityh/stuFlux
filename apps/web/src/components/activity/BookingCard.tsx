'use client';

import { ReactNode, useState, useEffect } from 'react';
import { isFuture, isPast, differenceInCalendarDays } from 'date-fns';
import {
  IconCalendar,
  IconUser,
  IconCamera,
  IconClock,
  IconDeviceLaptop,
  IconTent,
  IconDeviceGamepad,
  IconDrone,
  IconPackage,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { ActivityBooking } from './types';

export type DisplayStatus = 'active' | 'upcoming' | 'completed' | 'pending' | 'declined';

export function getDisplayStatus(booking: ActivityBooking): DisplayStatus {
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  const now = new Date();

  if (booking.status === 'pending') return 'pending';
  if (booking.status === 'rejected') return 'declined';
  if (booking.status === 'completed') return 'completed';
  if (booking.status === 'confirmed') {
    if (isPast(end)) return 'completed';
    if (isFuture(start)) return 'upcoming';
    return 'active';
  }
  return 'pending';
}

/* ── Status config: badge classes + left‑border accent + glow ring ── */

const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; classes: string; borderAccent: string }
> = {
  active: {
    label: 'Active',
    classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15',
    borderAccent: 'border-l-emerald-500',
  },
  upcoming: {
    label: 'Confirmed (upcoming)',
    classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15',
    borderAccent: 'border-l-indigo-500',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-foreground/5 text-foreground/50 border border-foreground/10',
    borderAccent: 'border-l-zinc-300 dark:border-l-zinc-700',
  },
  pending: {
    label: 'Awaiting approval',
    classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15',
    borderAccent: 'border-l-amber-500',
  },
  declined: {
    label: 'Declined',
    classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15',
    borderAccent: 'border-l-rose-500',
  },
};

function StatusBadge({ status }: { status: DisplayStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-normal ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

/* ── Helpers ── */

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysText(booking: ActivityBooking): string {
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  const now = new Date();

  if (booking.status === 'confirmed') {
    if (start <= now && end >= now) {
      const remaining = differenceInCalendarDays(end, now);
      return remaining === 0 ? 'Ends today' : `${remaining}d remaining`;
    }
    if (isFuture(start)) {
      const startsIn = differenceInCalendarDays(start, now);
      return startsIn === 0 ? 'Starts today' : `in ${startsIn}d`;
    }
  }
  return `${booking.total_days}d`;
}

function getFallbackIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('camera') || lower.includes('alpha') || lower.includes('lens')) {
    return <IconCamera className="w-5.5 h-5.5 text-foreground/50" />;
  }
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('computer')) {
    return <IconDeviceLaptop className="w-5.5 h-5.5 text-foreground/50" />;
  }
  if (lower.includes('tent') || lower.includes('camping') || lower.includes('outdoor')) {
    return <IconTent className="w-5.5 h-5.5 text-foreground/50" />;
  }
  if (lower.includes('switch') || lower.includes('nintendo') || lower.includes('game') || lower.includes('console')) {
    return <IconDeviceGamepad className="w-5.5 h-5.5 text-foreground/50" />;
  }
  if (lower.includes('drone') || lower.includes('mavic') || lower.includes('dji')) {
    return <IconDrone className="w-5.5 h-5.5 text-foreground/50" />;
  }
  return <IconPackage className="w-5.5 h-5.5 text-foreground/50" />;
}

/* ── Branded Thumbnail component ── */
export function ListingThumbnail({ title, url }: { title: string; url: string | null | undefined }) {
  const [hasError, setHasError] = useState(false);
  const char = title.charAt(0).toUpperCase();
  const fallbackIcon = getFallbackIcon(title);

  return (
    <div className="w-[60px] h-[60px] shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-surface to-foreground/5 border border-border/40 flex items-center justify-center relative shadow-sm group-hover:border-border/60 transition-all">
      {url && !hasError ? (
        <img
          src={url}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-surface/90 via-foreground/5 to-surface/40 relative">
          {/* Subtle colored blur behind icon */}
          <div className="absolute inset-0 bg-accent/5 opacity-40 blur-sm rounded-full pointer-events-none" />
          <div className="relative z-10 opacity-70 group-hover:opacity-90 transition-opacity">
            {fallbackIcon}
          </div>
          <span className="text-[10px] font-extrabold text-foreground/45 absolute bottom-1 right-2 uppercase tracking-wider font-display">
            {char}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Live Response Countdown Timer ── */
export function ResponseTimer({ createdAt }: { createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(createdAt).getTime();
      const limitTime = createdTime + 24 * 60 * 60 * 1000;
      const now = Date.now();
      const diff = limitTime - now;

      if (diff <= 0) {
        setTimeLeft('Response overdue');
        setProgress(0);
        setIsOverdue(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      setProgress((diff / (24 * 60 * 60 * 1000)) * 100);
      setIsOverdue(false);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <div className="flex flex-col gap-1 min-w-[120px] max-w-[180px]">
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
        <span className={isOverdue ? 'text-rose-500' : 'text-amber-500'}>
          {timeLeft}
        </span>
      </div>
      <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden border border-border/10">
        <div 
          className={`h-full transition-all duration-1000 rounded-full ${isOverdue ? 'bg-rose-500' : progress < 25 ? 'bg-rose-400' : 'bg-amber-500'}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

/* ── Card ── */

interface BookingCardProps {
  booking: ActivityBooking;
  role: 'renter' | 'owner';
  /** Extra content rendered below the meta row (actions etc.) */
  footer?: ReactNode;
  /** Quote message (for incoming requests) */
  showMessage?: boolean;
}

export default function BookingCard({ booking, role, footer, showMessage }: BookingCardProps) {
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  const status = getDisplayStatus(booking);
  const otherUser = role === 'renter' ? booking.owner : booking.renter;
  const daysText = getDaysText(booking);
  const cfg = STATUS_CONFIG[status];

  // Lender return due soon warning
  const remainingDays = differenceInCalendarDays(end, new Date());
  const isReturningSoon = role === 'owner' && status === 'active' && remainingDays <= 1;

  return (
    <div
      className={`group flex flex-col gap-2.5 p-4 rounded-[12px] border-[0.5px] border-border/50 border-l-[3.5px] bg-surface hover:border-border transition-colors ${cfg.borderAccent}`}
    >
      <div className="flex gap-3.5">
        {/* Unified fallback thumbnail */}
        <ListingThumbnail title={booking.listing.title} url={booking.listing_photo?.url} />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Row 1: title + price */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-bold text-foreground leading-tight truncate">
              {booking.listing.title}
            </p>
            <p className="text-[14px] font-bold text-foreground shrink-0">
              {formatCurrency(booking.total_amount)}
            </p>
          </div>

          {/* Row 2: status + dates + days + person */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <StatusBadge status={status} />
            <span className="flex items-center gap-1 text-[12px] text-foreground/50">
              <IconCalendar className="w-3.5 h-3.5" stroke={1.5} />
              {formatDate(start)} – {formatDate(end)}
            </span>
            <span className="text-[12px] text-foreground/45 font-semibold">{daysText}</span>
            <span className="flex items-center gap-1 text-[12px] text-foreground/50">
              <IconUser className="w-3.5 h-3.5" stroke={1.5} />
              {otherUser.display_name}
            </span>
          </div>
        </div>
      </div>

      {/* Warning banner for lender return due soon */}
      {isReturningSoon && (
        <div className="mt-1 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-[12px] text-rose-500 dark:text-rose-400 font-bold animate-pulse">
          <IconAlertTriangle className="w-4 h-4 shrink-0" stroke={2} />
          <span>
            {remainingDays === 0 
              ? 'Return Due Today: Coordinate dropoff & inspect item' 
              : 'Return Due Tomorrow: Coordinate handback with renter'}
          </span>
        </div>
      )}

      {/* Countdown Timer */}
      {status === 'pending' && role === 'owner' && (
        <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2 mt-1">
          <span className="text-[11px] text-foreground/40 font-bold uppercase tracking-wider">Action Urgency</span>
          <ResponseTimer createdAt={booking.created_at} />
        </div>
      )}

      {/* Optional message quote */}
      {showMessage && booking.message && (
        <div className="border-l-2 border-[var(--accent)] bg-foreground/5 p-2 rounded-r-md mt-1">
          <p className="text-[12px] text-foreground/60 italic leading-[1.5]">
            &quot;{booking.message}&quot;
          </p>
        </div>
      )}

      {/* Optional footer */}
      {footer && (
        <div className="pt-2.5 border-t border-border/30 mt-1">
          {footer}
        </div>
      )}
    </div>
  );
}
