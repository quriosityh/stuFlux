'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export type InAppNotification =
  | {
      type: 'booking_request';
      bookingId: string;
      listingTitle: string;
      renterName: string;
      startDate: string;
      endDate: string;
      conversationId: string;
    }
  | {
      type: 'booking_confirmed';
      bookingId: string;
      listingTitle: string;
      lenderName: string;
      startDate: string;
      endDate: string;
      conversationId: string;
    }
  | {
      type: 'booking_rejected';
      bookingId: string;
      listingTitle: string;
      startDate: string;
      endDate: string;
    }
  | {
      type: 'new_message';
      conversationId: string;
      senderName: string;
      preview: string;
    };

/**
 * Keeps the authenticated user's notification SSE stream open. Consumers can
 * subscribe to `stuflux:notification` until a dedicated notification store or
 * toast system is introduced.
 */
export function NotificationStream() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (message) => {
      try {
        const notification = JSON.parse(message.data) as InAppNotification;
        window.dispatchEvent(
          new CustomEvent<InAppNotification>('stuflux:notification', { detail: notification }),
        );
      } catch {
        // Ignore malformed events without interrupting EventSource reconnects.
      }
    };

    return () => eventSource.close();
  }, [isSignedIn]);

  return null;
}
