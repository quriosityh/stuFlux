'use client';

import { useNotifications } from '@/components/NotificationStream';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight,
  BellOff,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { InAppNotification, NotificationItem } from '@/components/NotificationStream';

function getConfig(n: InAppNotification) {
  switch (n.type) {
    case 'booking_request':
      return {
        Icon: CalendarDays,
        accent: '#6366f1',
        bg: 'rgba(99,102,241,0.10)',
        label: 'Booking Request',
        body: `${n.renterName} wants to rent "${n.listingTitle}"`,
        href: `/bookings/${n.bookingId}`,
        cta: 'View Request',
        tag: 'Booking',
      };
    case 'booking_confirmed':
      return {
        Icon: CheckCircle2,
        accent: '#10b981',
        bg: 'rgba(16,185,129,0.10)',
        label: 'Booking Confirmed',
        body: `${n.lenderName} approved your request for "${n.listingTitle}"`,
        href: `/bookings/${n.bookingId}`,
        cta: 'See Details',
        tag: 'Booking',
      };
    case 'booking_rejected':
      return {
        Icon: XCircle,
        accent: '#f43f5e',
        bg: 'rgba(244,63,94,0.10)',
        label: 'Booking Declined',
        body: `Your request for "${n.listingTitle}" was declined`,
        href: null,
        cta: null,
        tag: 'Booking',
      };
    case 'booking_cancelled':
      return {
        Icon: Ban,
        accent: '#f97316',
        bg: 'rgba(249,115,22,0.10)',
        label: 'Booking Cancelled',
        body: `${n.cancelledBy} cancelled "${n.listingTitle}"`,
        href: '/bookings',
        cta: 'View Bookings',
        tag: 'Booking',
      };
    case 'new_message':
      return {
        Icon: MessageSquare,
        accent: '#0ea5e9',
        bg: 'rgba(14,165,233,0.10)',
        label: n.senderName,
        body: n.preview,
        href: `/messages/${n.conversationId}`,
        cta: 'Reply',
        tag: 'Message',
      };
  }
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const cfg = getConfig(item.notification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      onClick={() => onRead(item.id)}
      className={`group relative flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
        item.read ? 'opacity-60' : ''
      }`}
      style={{ background: item.read ? 'transparent' : cfg.bg }}
    >
      {/* Unread dot */}
      {!item.read && (
        <div
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ background: cfg.accent }}
        />
      )}

      {/* Icon */}
      <div
        className="mt-0.5 p-2.5 rounded-xl shrink-0 h-fit"
        style={{ background: cfg.bg, color: cfg.accent }}
      >
        <cfg.Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold text-foreground/90">{cfg.label}</span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.accent }}
          >
            {cfg.tag}
          </span>
        </div>
        <p className="text-[13px] text-foreground/55 leading-relaxed">{cfg.body}</p>
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[11px] text-foreground/35">
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
          {cfg.href && (
            <Link
              href={cfg.href as never}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: cfg.accent }}
            >
              {cfg.cta}
              <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-16 lg:pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-indigo-500/10">
                <Bell size={20} className="text-indigo-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/40 pl-[52px]">
              Your booking and message updates, saved in one inbox
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-border/40 text-foreground/60 hover:text-foreground hover:border-border transition-all"
            >
              <Check size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="border border-border/20 rounded-2xl overflow-hidden divide-y divide-border/10">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="p-4 rounded-2xl bg-foreground/5 mb-4">
                  <BellOff size={28} className="text-foreground/25" />
                </div>
                <p className="text-sm font-medium text-foreground/40">You&apos;re all caught up</p>
                <p className="text-xs text-foreground/25 mt-1">
                  New notifications will appear here in real-time
                </p>
              </motion.div>
            ) : (
              items.map((item) => (
                <NotificationRow key={item.id} item={item} onRead={markRead} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
