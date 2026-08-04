'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api-client';

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
    }
  | {
      type: 'booking_cancelled';
      bookingId: string;
      listingTitle: string;
      cancelledBy: string;
    };

type StreamNotification = InAppNotification & { notificationId?: string };

type StoredNotification = {
  id: string;
  payload: InAppNotification;
  read_at: string | null;
  created_at: string;
};

export interface NotificationItem {
  id: string;
  notification: InAppNotification;
  timestamp: Date;
  read: boolean;
}

// Global store so any component can subscribe
type Listener = (item: NotificationItem) => void;
const listeners = new Set<Listener>();
export function subscribeToNotifications(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function broadcast(item: NotificationItem) {
  listeners.forEach((fn) => fn(item));
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * Mounts once in the layout (inside <SignedIn>).
 * - Opens an SSE stream to /api/proxy/notifications/stream (proxied to backend)
 * - Subscribes to Web Push
 * - Broadcasts all events to the global notification store
 */
export function NotificationStream() {
  const { isSignedIn, getToken } = useAuth();

  // ── SSE ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const connect = async () => {
      // Pass Clerk JWT in the URL (SSE cannot set headers)
      const token = await getToken();
      if (!token) return;

      es = new EventSource(`/api/proxy/notifications/stream?token=${token}`);

      es.onmessage = (e) => {
        try {
          const notification = JSON.parse(e.data) as StreamNotification;
          const item: NotificationItem = {
            id: notification.notificationId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            notification,
            timestamp: new Date(),
            read: false,
          };
          broadcast(item);
          // Also fire the legacy CustomEvent for any other listeners
          window.dispatchEvent(
            new CustomEvent<InAppNotification>('stuflux:notification', { detail: notification }),
          );
        } catch {
          // ignore malformed frames
        }
      };

      es.onerror = () => {
        es?.close();
        // Simple exponential back-off reconnect
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    void connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, [isSignedIn, getToken]);

  // ── Web Push ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    let cancelled = false;

    const subscribe = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const existing = await reg.pushManager.getSubscription();
        const sub =
          existing ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          }));

        const token = await getToken();
        if (!token || cancelled) return;

        const p256dh = sub.getKey('p256dh');
        const auth = sub.getKey('auth');
        if (!p256dh || !auth) return;

        await fetch('/api/proxy/push/subscribe', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
              auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
            },
          }),
        });
      } catch (err) {
        console.error('[push] subscribe error:', err);
      }
    };

    void subscribe();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  return null;
}

/**
 * Hook that returns the in-app notification inbox.
 * Works anywhere inside the app — no context provider needed.
 */
export function useNotifications() {
  const api = useApiClient();
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let active = true;
    api.get('notifications')
      .json<{ data: StoredNotification[] }>()
      .then(({ data }) => {
        if (!active) return;
        setItems(data.map((item) => ({
          id: item.id,
          notification: item.payload,
          timestamp: new Date(item.created_at),
          read: Boolean(item.read_at),
        })));
      })
      .catch(() => {
        // The live stream remains available even if history cannot be loaded.
      });
    return () => { active = false; };
  }, [api]);

  useEffect(() => {
    return subscribeToNotifications((item) => {
      setItems((prev) => [item, ...prev].slice(0, 50)); // cap at 50
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void api.patch(`notifications/${id}/read`);
  }, [api]);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    void api.patch('notifications/read-all');
  }, [api]);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, unreadCount, markRead, markAllRead };
}
