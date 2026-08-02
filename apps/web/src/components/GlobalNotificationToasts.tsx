'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  subscribeToNotifications,
  type InAppNotification,
  type NotificationItem,
} from './NotificationStream';

function getConfig(n: InAppNotification) {
  switch (n.type) {
    case 'booking_request':
      return {
        Icon: CalendarDays,
        accent: '#6366f1',
        bg: 'rgba(99,102,241,0.08)',
        title: 'Booking Request',
        body: `${n.renterName} wants to rent "${n.listingTitle}"`,
        href: `/bookings/${n.bookingId}`,
        cta: 'View Request',
      };
    case 'booking_confirmed':
      return {
        Icon: CheckCircle2,
        accent: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        title: 'Booking Confirmed ✓',
        body: `${n.lenderName} approved "${n.listingTitle}"`,
        href: `/bookings/${n.bookingId}`,
        cta: 'See Details',
      };
    case 'booking_rejected':
      return {
        Icon: XCircle,
        accent: '#f43f5e',
        bg: 'rgba(244,63,94,0.08)',
        title: 'Booking Declined',
        body: `Your request for "${n.listingTitle}" was declined`,
        href: null,
        cta: null,
      };
    case 'new_message':
      return {
        Icon: MessageSquare,
        accent: '#0ea5e9',
        bg: 'rgba(14,165,233,0.08)',
        title: n.senderName,
        body: n.preview,
        href: `/messages/${n.conversationId}`,
        cta: 'Reply',
      };
  }
}

function Toast({
  item,
  onClose,
}: {
  item: NotificationItem;
  onClose: (id: string) => void;
}) {
  const cfg = getConfig(item.notification);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.92, transition: { duration: 0.18 } }}
      style={{ background: 'rgba(15,15,18,0.92)', borderLeft: `3px solid ${cfg.accent}` }}
      className="relative w-[340px] rounded-xl overflow-hidden backdrop-blur-xl border border-white/[0.07] shadow-2xl pointer-events-auto"
    >
      {/* Subtle accent glow strip */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${cfg.bg} 0%, transparent 70%)` }}
      />

      <div className="relative flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className="mt-0.5 p-2 rounded-lg shrink-0"
          style={{ background: cfg.bg, color: cfg.accent }}
        >
          <cfg.Icon size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white/90 leading-tight">{cfg.title}</p>
          <p className="mt-1 text-[12px] text-white/50 leading-relaxed line-clamp-2">{cfg.body}</p>
          {cfg.href && (
            <Link
              href={cfg.href as any}
              onClick={() => onClose(item.id)}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold rounded-md px-2.5 py-1 transition-opacity hover:opacity-80"
              style={{ background: cfg.accent + '22', color: cfg.accent }}
            >
              {cfg.cta}
              <ArrowRight size={11} />
            </Link>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onClose(item.id)}
          className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-md hover:bg-white/5"
          aria-label="dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function GlobalNotificationToasts() {
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  useEffect(() => {
    return subscribeToNotifications((item) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 6000);
    });
  }, []);

  const close = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onClose={close} />
        ))}
      </AnimatePresence>
    </div>
  );
}
