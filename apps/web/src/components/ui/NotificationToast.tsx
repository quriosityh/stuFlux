'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  X,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { InAppNotification } from '../NotificationStream';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  notification: InAppNotification;
  onClose: (id: string) => void;
}

export function NotificationToast({ id, notification, onClose }: ToastProps) {
  // Determine style properties based on the notification type
  const config = (() => {
    switch (notification.type) {
      case 'booking_request':
        return {
          icon: CalendarDays,
          iconClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
          title: 'Booking Request',
          message: `${notification.renterName} wants to rent "${notification.listingTitle}"`,
          actionLabel: 'View Request',
          actionUrl: `/bookings/${notification.bookingId}`,
          borderClass: 'border-indigo-100/50 dark:border-indigo-950/30',
        };
      case 'booking_confirmed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
          title: 'Booking Confirmed',
          message: `${notification.lenderName} approved your request for "${notification.listingTitle}"`,
          actionLabel: 'Details',
          actionUrl: `/bookings/${notification.bookingId}`,
          borderClass: 'border-emerald-100/50 dark:border-emerald-950/30',
        };
      case 'booking_rejected':
        return {
          icon: XCircle,
          iconClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
          title: 'Booking Rejected',
          message: `Your request for "${notification.listingTitle}" was declined`,
          actionLabel: null,
          actionUrl: null,
          borderClass: 'border-rose-100/50 dark:border-rose-950/30',
        };
      case 'new_message':
        return {
          icon: MessageSquare,
          iconClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
          title: notification.senderName,
          message: notification.preview,
          actionLabel: 'Reply',
          actionUrl: `/messages/${notification.conversationId}`,
          borderClass: 'border-sky-100/50 dark:border-sky-950/30',
        };
      default:
        return {
          icon: MessageSquare,
          iconClass: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950/40',
          title: 'Notification',
          message: 'You have a new update',
          actionLabel: null,
          actionUrl: null,
          borderClass: 'border-neutral-100/50 dark:border-neutral-950/30',
        };
    }
  })();

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={cn(
        "flex w-full max-w-md pointer-events-auto rounded-2xl",
        "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md",
        "shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]",
        "border border-white/20 dark:border-neutral-800/40",
        config.borderClass,
        "p-4 transition-all duration-300 hover:shadow-[0_12px_45px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Icon wrapper */}
        <div className={cn("p-2.5 rounded-xl shrink-0", config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">
            {config.title}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-normal">
            {config.message}
          </p>

          {/* Action Button */}
          {config.actionUrl && (
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={config.actionUrl as any}
                onClick={() => onClose(id)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                  "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                )}
              >
                {config.actionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className={cn(
            "p-1 rounded-lg shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
