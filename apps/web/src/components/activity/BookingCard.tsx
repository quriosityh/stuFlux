'use client';

import { ReactNode } from 'react';
import { isFuture, isPast, differenceInDays } from 'date-fns';
import {
  IconCalendar,
  IconUser,
  IconCamera,
  IconClock,
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
    classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_6px_rgba(16,185,129,0.25)]',
    borderAccent: 'border-l-emerald-500',
  },
  upcoming: {
    label: 'Upcoming',
    classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-[0_0_6px_rgba(59,130,246,0.25)]',
    borderAccent: 'border-l-blue-500',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-foreground/8 text-foreground/40 border border-foreground/10',
    borderAccent: 'border-l-foreground/20',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-[0_0_6px_rgba(245,158,11,0.25)]',
    borderAccent: 'border-l-amber-500',
  },
  declined: {
    label: 'Declined',
    classes: 'bg-red-500/15 text-red-400 border border-red-500/25',
    borderAccent: 'border-l-red-500/40',
  },
};

function StatusBadge({ status }: { status: DisplayStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.classes}`}>
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
      const remaining = differenceInDays(end, now);
      return remaining === 0 ? 'Ends today' : `${remaining}d remaining`;
    }
    if (isFuture(start)) {
      const startsIn = differenceInDays(start, now);
      return startsIn === 0 ? 'Starts today' : `in ${startsIn}d`;
    }
  }
  return `${booking.total_days}d`;
}

/** Branded letter placeholder when image can't load */
function LetterPlaceholder({ title }: { title: string }) {
  // Derive a consistent hue from the first character
  const char = title.charAt(0).toUpperCase();
  const hue = ((char.charCodeAt(0) - 65) * 37) % 360;

  return (
    <div
      className="w-full h-full flex items-center justify-center text-[18px] font-medium text-white"
      style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
    >
      {char}
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

  return (
    <div
      className={`group flex gap-3 p-4 rounded-[12px] border-[0.5px] border-border/60 border-l-[3px] bg-surface hover:border-border transition-colors ${cfg.borderAccent}`}
    >
      {/* Thumbnail with letter‑fallback */}
      <div className="w-[56px] h-[56px] shrink-0 rounded-lg overflow-hidden bg-foreground/5 border border-border/40 flex items-center justify-center">
        {booking.listing_photo?.url ? (
          <img
            src={booking.listing_photo.url}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide broken image — the LetterPlaceholder sibling will show instead
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling;
              if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        {/* Letter placeholder: visible when there's no photo, or when img fails to load */}
        <div
          className="w-full h-full"
          style={{ display: booking.listing_photo?.url ? 'none' : 'flex' }}
        >
          <LetterPlaceholder title={booking.listing.title} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Row 1: title + price */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-medium text-foreground leading-tight truncate">
            {booking.listing.title}
          </p>
          <p className="text-[14px] font-medium text-foreground shrink-0">
            {formatCurrency(booking.total_amount)}
          </p>
        </div>

        {/* Row 2: status + dates + days + person */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={status} />
          <span className="flex items-center gap-1 text-[12px] text-foreground/50">
            <IconCalendar className="w-3.5 h-3.5" stroke={1.5} />
            {formatDate(start)} – {formatDate(end)}
          </span>
          <span className="text-[12px] text-foreground/40">{daysText}</span>
          <span className="flex items-center gap-1 text-[12px] text-foreground/50">
            <IconUser className="w-3.5 h-3.5" stroke={1.5} />
            {otherUser.display_name}
          </span>
          {status === 'pending' && role === 'owner' && (
            <span className="flex items-center gap-1 text-[12px] text-amber-500 font-medium animate-urgent-pulse">
              <IconClock className="w-3.5 h-3.5" stroke={1.5} />
              Respond within 24h
            </span>
          )}
        </div>

        {/* Optional message quote */}
        {showMessage && booking.message && (
          <div className="border-l-2 border-accent bg-foreground/5 p-2 rounded-r-md mt-1">
            <p className="text-[12px] text-foreground/60 italic leading-[1.5]">
              &quot;{booking.message}&quot;
            </p>
          </div>
        )}

        {/* Optional footer (actions etc.) */}
        {footer && (
          <div className="pt-2 border-t border-border/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
