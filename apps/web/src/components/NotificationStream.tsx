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

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }
  return buffer;
}

/**
 * Keeps the authenticated user's notification SSE stream open. Consumers can
 * subscribe to `stuflux:notification` until a dedicated notification store or
 * toast system is introduced.
 */
export function NotificationStream() {
  const { isSignedIn, getToken } = useAuth();

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

  useEffect(() => {
    if (!isSignedIn || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    let cancelled = false;

    const subscribeToPush = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const subscription =
          (await registration.pushManager.getSubscription()) ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToArrayBuffer(publicKey),
          }));
        const token = await getToken();
        if (!token || cancelled) return;

        const p256dh = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');
        if (!p256dh || !auth) return;

        await fetch('/api/proxy/push/subscribe', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
              auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
            },
          }),
        });
      } catch (error) {
        console.error('[push] Unable to subscribe:', error);
      }
    };

    void subscribeToPush();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn]);

  return null;
}
