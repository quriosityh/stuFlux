# StuFlux Notification System — Implementation TODOs

Three-stage implementation plan. Each stage is self-contained and must be completed
in order. Stages 1 and 2 are backend-only changes plus a small frontend connection.
Stage 3 (email) can run in parallel with Stage 2 once Stage 1 is done.

---

## Project Context (read before starting any stage)

**Stack:**
- Backend: Express.js + TypeScript, located at `apps/api/`
- Auth middleware: `src/infra/http/middleware/auth.ts` — exports `requireAuth` and `AuthenticatedRequest`
- ORM: Drizzle ORM with PostgreSQL (Neon). Client at `src/infra/db/client.ts`
- Module pattern: every module has `controller.ts`, `service.ts`, `repository.ts`, `routes.ts`, `validations.ts`, `index.ts`
- Module router registered in `src/modules/index.ts`
- Frontend: Next.js at `apps/web/`. Rewrites all `/api/proxy/:path*` calls to `http://localhost:4000/api/v1/:path*`

**Critical auth facts (do not guess — read this):**
- `req.auth.userId` is the **internal database UUID** from the `users` table. It is set by `requireAuth` after calling `ensureUserSynced()`.
- `req.auth.clerkUserId` is the raw Clerk string (e.g. `user_abc123`).
- **Never look up a user by `clerk_user_id` inside handlers — `requireAuth` already did it. Use `req.auth!.userId` directly as the internal UUID everywhere.**

**`listing.owner` shape returned by `listingsRepository.findById()`:**
```ts
owner: {
  id: string;           // internal database UUID — use this everywhere
  display_name: string;
  area: string;
  avatar_url: string | null;
  email: string | null;
}
```
There is no `owner.internalId`. The UUID is `owner.id`.

**Existing SSE infrastructure (per-conversation chat):**
- `src/infra/events/messageEmitter.ts` — exports `messageEmitter` (EventEmitter), `trackStream`, `untrackStream`, `isUserConnected`, `activeStreams`
- Existing conversation stream: `GET /conversations/:id/stream` in `src/modules/messages/controller.ts`
- Emits on channel `conversation:{conversationId}`
- Heartbeat: `:heartbeat\n\n` every 25 seconds
- On `req.on('close', ...)`: remove listener, untrack

**Existing booking service trigger points** (where notifications must be emitted):
- `src/modules/bookings/service.ts → createBooking()` — lender must be notified (emit to owner)
- `src/modules/bookings/service.ts → confirmBooking()` — renter must be notified
- `src/modules/bookings/service.ts → rejectBooking()` — renter must be notified

**Existing message service trigger point:**
- `src/modules/messages/service.ts → sendMessage()` — recipient must be notified

**Known architectural constraint:**
The `notificationEmitter` (like the existing `messageEmitter`) is an in-process Node.js EventEmitter.
It works correctly for a **single API process**. If the API is ever horizontally scaled to multiple
instances, this will not fan out across processes — a separate pub/sub layer (e.g. Redis Pub/Sub)
would be required. This is an accepted limitation for MVP; document it with a comment in
`notificationEmitter.ts` so it is not forgotten.

---

## Stage 1 — Global User SSE Stream (In-App Notifications)

**Status: `TODO`**

### What this does
Opens one persistent SSE connection per authenticated user when the app loads.
The backend can emit events to that user from anywhere (booking events, new messages).
This is parallel to the existing per-conversation SSE — it does NOT replace it.

### Channel and routing
- Channel key: `user:{internalUserId}` where `internalUserId = req.auth!.userId`
- One logical stream per user. Multiple browser tabs open by the same user each
  connect separately — presence tracking must use a **reference count** (not a Set with
  a single sentinel value) so closing one tab does not evict the user's other active streams.

### Notification event payload
All events share this TypeScript union type (define it in `notificationEmitter.ts`):
```ts
export type NotificationEvent =
  | {
      type: 'booking_request';
      bookingId: string;
      listingTitle: string;
      renterName: string;
      startDate: string;   // ISO date string e.g. "2025-07-15"
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
      preview: string;     // first 60 chars of message body
    };
```

---

### Files to create

#### `src/infra/events/notificationEmitter.ts` (NEW)

```ts
import { EventEmitter } from 'events';

export type NotificationEvent =
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

// NOTE: This is an in-process EventEmitter. It works correctly on a single API
// instance. For horizontal scaling across multiple processes, replace with a
// Redis Pub/Sub adapter before deploying multiple API replicas.
export const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(0);

// Reference-counted presence: Map<internalUserId, connectionCount>
// A user may have multiple tabs open — we track how many active SSE connections
// they have rather than a simple boolean, so closing one tab does not incorrectly
// mark them as disconnected when another tab remains connected.
const userConnectionCount = new Map<string, number>();

export const trackUserStream = (userId: string): void => {
  userConnectionCount.set(userId, (userConnectionCount.get(userId) ?? 0) + 1);
};

export const untrackUserStream = (userId: string): void => {
  const current = userConnectionCount.get(userId) ?? 0;
  if (current <= 1) {
    userConnectionCount.delete(userId);
  } else {
    userConnectionCount.set(userId, current - 1);
  }
};

export const isUserStreaming = (userId: string): boolean => {
  return (userConnectionCount.get(userId) ?? 0) > 0;
};
```

---

#### `src/modules/notifications/controller.ts` (NEW)

```ts
import { Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { notificationEmitter, trackUserStream, untrackUserStream } from '../../infra/events/notificationEmitter.js';
import type { NotificationEvent } from '../../infra/events/notificationEmitter.js';

export const streamNotificationsHandler = [
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // req.auth!.userId is already the internal DB UUID — no additional lookup needed.
    const userId = req.auth!.userId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    trackUserStream(userId);

    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 25000);

    const listener = (payload: NotificationEvent) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    notificationEmitter.on(`user:${userId}`, listener);

    req.on('close', () => {
      clearInterval(heartbeat);
      notificationEmitter.off(`user:${userId}`, listener);
      untrackUserStream(userId);
    });
  }),
];
```

---

#### `src/modules/notifications/routes.ts` (NEW)

```ts
import { Router } from 'express';
import { streamNotificationsHandler } from './controller.js';

const router: Router = Router();
router.get('/notifications/stream', ...streamNotificationsHandler);
export default router;
```

#### `src/modules/notifications/index.ts` (NEW)
```ts
export { default } from './routes.js';
```

#### Register in `src/modules/index.ts`
Add two lines:
```ts
import notificationsRoutes from './notifications/index.js';
// ...inside the apiV1 router setup:
apiV1.use('/', notificationsRoutes);
```

---

### Wire emission into existing services

#### `src/modules/bookings/service.ts`

Add import at top:
```ts
import { notificationEmitter } from '../../infra/events/notificationEmitter.js';
```

**In `createBooking()`** — immediately after the system message is posted to the conversation,
emit to the **lender** (the listing owner). The owner's internal UUID and name are available
directly on the listing object returned by `listingsRepository.findById()`:

```ts
// listing.owner.id   = lender's internal UUID
// listing.owner.display_name = lender's display name
// renterId is the renter's internal UUID (it's the function parameter)
// For renterName: query users table where id = renterId, or pass it through from
//   the user object returned by ensureUserSynced inside requireAuth

notificationEmitter.emit(`user:${listing.owner.id}`, {
  type: 'booking_request',
  bookingId: booking.id,
  listingTitle: listing.title,
  renterName: /* renter display_name — fetch from db: SELECT display_name FROM users WHERE id = renterId */,
  startDate: booking.start_date,
  endDate: booking.end_date,
  conversationId: conversation!.id,   // conversation is already in scope from the wire-up added earlier
} satisfies NotificationEvent);
```

> To get renterName: add a `findDisplayName(userId: string): Promise<string>` helper to `messages/repository.ts`
> or `users/repository.ts` that does `SELECT display_name FROM users WHERE id = $userId`. Do not make
> a full profile fetch just for a name.

**In `confirmBooking()`** — emit to the **renter**.
`booking.renter_id` is the renter's internal UUID. The listing title and lender name must be
fetched. The `conversationId` requires a lookup by `booking_id` — add `findConversationByBookingId`
to `messages/repository.ts` (see below):

```ts
const [listing, conversation] = await Promise.all([
  listingsRepository.findById(booking.listing_id),
  messagesRepository.findConversationByBookingId(bookingId),
]);

notificationEmitter.emit(`user:${booking.renter_id}`, {
  type: 'booking_confirmed',
  bookingId: booking.id,
  listingTitle: listing?.title ?? '',
  lenderName: listing?.owner.display_name ?? '',
  startDate: booking.start_date,
  endDate: booking.end_date,
  conversationId: conversation?.id ?? '',
} satisfies NotificationEvent);
```

**In `rejectBooking()`** — emit to the **renter** (no conversationId needed):

```ts
const listing = await listingsRepository.findById(booking.listing_id);

notificationEmitter.emit(`user:${booking.renter_id}`, {
  type: 'booking_rejected',
  bookingId: booking.id,
  listingTitle: listing?.title ?? '',
  startDate: booking.start_date,
  endDate: booking.end_date,
} satisfies NotificationEvent);
```

---

#### New repository method needed: `findConversationByBookingId`

Add to `src/modules/messages/repository.ts`:
```ts
findConversationByBookingId: async (bookingId: string) => {
  return db.query.conversations.findFirst({
    where: eq(conversations.booking_id, bookingId),
  });
},
```

---

#### `src/modules/messages/service.ts`

In `sendMessage()`, after `messagesRepository.addMessage()` is called, emit to the **recipient's**
global user stream. The recipient's internal UUID is already in scope as `recipientId`:

```ts
import { notificationEmitter } from '../../infra/events/notificationEmitter.js';

// After addMessage():
// senderName: fetch display_name for senderId from users table
notificationEmitter.emit(`user:${recipientId}`, {
  type: 'new_message',
  conversationId: conversation!.id,
  senderName: /* sender display_name — same findDisplayName helper as above */,
  preview: data.body.trim().slice(0, 60),
} satisfies NotificationEvent);
```

---

### Frontend SSE connection (Next.js — `apps/web/`)

**Problem:** Browser `EventSource` cannot set an `Authorization` header. The API requires
`Bearer {token}`. The solution is a **Next.js Route Handler** that fetches the Clerk token
server-side (or via the Clerk `useAuth` hook client-side) and proxies the SSE stream.

**Recommended approach — Next.js Route Handler proxy:**

Create `apps/web/src/app/api/notifications/stream/route.ts`:
```ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  const apiUrl = `${process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1'}/notifications/stream`;

  // Proxy the SSE stream: fetch the API endpoint with the Bearer token and pipe
  // the response body straight back to the browser.
  const upstream = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
    // Abort the API request when EventSource disconnects, so Express runs its
    // close handler and removes the SSE listener immediately.
    signal: req.signal,
  });

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Client component connection** (mount once at the root layout level, only when authenticated):
```ts
// Path: apps/web/src/components/NotificationStream.tsx  (client component)
'use client';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function NotificationStream() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    // Connect to the Next.js proxy route — no auth header needed, Clerk session cookie handles it
    const es = new EventSource('/api/notifications/stream');

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      // Dispatch to toast / global notification state based on event.type
      console.log('[notification]', event);
    };

    es.onerror = () => {
      // Browser auto-reconnects on error; no manual retry needed
    };

    return () => es.close();
  }, [isSignedIn]);

  return null;
}
```

Mount `<NotificationStream />` inside the authenticated layout so it opens exactly once
per session.

---

## Stage 2 — Web Push Notifications (Out-of-Tab, Browser in Background)

**Status: `TODO` — implement after Stage 1 is complete and verified**

### What this does
Sends a native OS-level browser push notification when the user's StuFlux tab is closed
but the browser is still running in the background. Uses the Web Push API with self-generated
VAPID keys — free, no third-party service required.

### Prerequisites
- Stage 1 must be working
- Install `web-push` in `apps/api/`: `npm install web-push @types/web-push`
- Generate VAPID keys once: `npx web-push generate-vapid-keys`
- Add to `apps/api/.env`:
  ```
  VAPID_PUBLIC_KEY=<your generated public key>
  VAPID_PRIVATE_KEY=<your generated private key>
  VAPID_SUBJECT=mailto:your@email.com
  ```
- Add to `apps/web/.env.local`:
  ```
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same public key>
  ```
- HTTPS is required in production. Neon + Vercel/Railway handle this automatically.

### Database schema change
Add to `apps/api/db/schema.ts`:
```ts
export const pushSubscriptions = pgTable('push_subscriptions', {
  id:       uuid('id').defaultRandom().primaryKey(),
  user_id:  uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(), // unique per device/browser
  p256dh:   text('p256dh').notNull(),
  auth:     text('auth').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```
Write and run a Drizzle migration after adding this. The generated migration directory is
`apps/api/db/migrations` (per `drizzle.config.ts`); update the existing migration runner,
which currently points to `./src/db/migrations`, before running it.

### New API endpoints

**`POST /push/subscribe`** (authenticated)
- Body: `{ endpoint: string, keys: { p256dh: string, auth: string } }`
- Upsert: insert the subscription; on conflict on `endpoint`, update `p256dh` and `auth`.
  Use `onConflictDoUpdate` targeting the `endpoint` unique constraint.
- Returns `{ status: 'subscribed' }`

**`DELETE /push/subscribe`** (authenticated)
- Body: `{ endpoint: string }`
- Delete the row where `endpoint = body.endpoint AND user_id = req.auth!.userId`.

Create this as a new `push` module following the existing module pattern.

### Backend push sender

Create `src/infra/push/sender.ts`:
```ts
import webpush from 'web-push';
import { db } from '../db/client.js';
import { pushSubscriptions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export type PushPayload = {
  type: string;
  title: string;
  body: string;
  url: string;
};

export async function sendPushToUser(
  internalUserId: string,
  payload: PushPayload,
): Promise<void> {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.user_id, internalUserId));

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired or invalid — clean it up
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
      } else {
        // Other errors: log only, do NOT rethrow — push failure must never break the booking flow
        console.error('[push] Failed to send to', sub.endpoint, err?.message);
      }
    }
  }
}
```

### Wire into existing services

In `bookings/service.ts`, after the `notificationEmitter.emit()` calls added in Stage 1, also call
`sendPushToUser()` for the same events. Use the same recipient UUIDs.

Push payload example:
```ts
sendPushToUser(listing.owner.id, {
  type: 'booking_request',
  title: 'New Rental Request',
  body: `${renterName} wants to rent your ${listing.title}`,
  url: '/bookings',
});
```

### Frontend service worker

Create `apps/web/public/sw.js`:
```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'StuFlux', {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

### Frontend subscription (client component)

```ts
// Standard base64 utility — copy exactly as shown, do not rewrite
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const reg = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });

  // Send subscription to the API through the Next.js proxy
  await fetch('/api/proxy/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
        auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
      },
    }),
  });
}
```

Call `subscribeToPush()` once after the user logs in (e.g. inside the same client component
as the SSE stream from Stage 1).

---

## Stage 3 — Email Notifications via Resend (Fully Offline)

**Status: `TODO` — can be implemented in parallel with Stage 2 once Stage 1 is done**

### What this does
Sends a transactional email for the two highest-value events: a new booking request (lender)
and a booking confirmation or rejection (renter). Does NOT send email for chat messages — too noisy.

### Service
**Resend** — [resend.com](https://resend.com). Free tier: 3,000 emails/month, 100/day.
No credit card required. Official `resend` npm SDK.

### Setup
```
npm install resend   # in apps/api/
```
Add to `apps/api/.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_ADDRESS=notifications@yourdomain.com
APP_URL=https://yourdomain.com
```
For local development set `APP_URL=http://localhost:3000`.

### Email sender utility

Create `src/infra/email/sender.ts`:
```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_ADDRESS!,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    // Log only — email failure must NEVER propagate as an API error
    console.error('[email] Failed to send to', params.to, err);
  }
}
```

### Email templates

Create `src/infra/email/templates.ts`:
```ts
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

export function bookingRequestEmail(p: {
  lenderName: string;
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `New rental request for "${p.listingTitle}"`,
    html: `
      <p>Hi ${p.lenderName},</p>
      <p><strong>${p.renterName}</strong> has requested to rent your item
         <strong>${p.listingTitle}</strong> from ${p.startDate} to ${p.endDate}.</p>
      <p><a href="${appUrl}/bookings">Review the request →</a></p>
      <p>— StuFlux</p>
    `,
  };
}

export function bookingConfirmedEmail(p: {
  renterName: string;
  listingTitle: string;
  lenderName: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Your booking for "${p.listingTitle}" is confirmed!`,
    html: `
      <p>Hi ${p.renterName},</p>
      <p><strong>${p.lenderName}</strong> confirmed your rental of
         <strong>${p.listingTitle}</strong> from ${p.startDate} to ${p.endDate}.</p>
      <p><a href="${appUrl}/bookings">View booking details →</a></p>
      <p>— StuFlux</p>
    `,
  };
}

export function bookingRejectedEmail(p: {
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Rental request for "${p.listingTitle}" was declined`,
    html: `
      <p>Hi ${p.renterName},</p>
      <p>Your rental request for <strong>${p.listingTitle}</strong>
         (${p.startDate} – ${p.endDate}) was not accepted.</p>
      <p><a href="${appUrl}/explore">Browse other listings →</a></p>
      <p>— StuFlux</p>
    `,
  };
}
```

### Wire into `bookings/service.ts`

Import `sendEmail` and the three template functions. After each `notificationEmitter.emit()` call,
send the corresponding email. The recipient's email address is available on the `listing.owner.email`
field (already returned by `listingsRepository.findById()`). For the renter's email, you must
query the `users` table by `renter_id` — add a `findEmailById(userId: string)` helper to
`users/repository.ts` that returns `{ email, display_name }`.

**`createBooking()`** — email to lender:
```ts
if (listing.owner.email) {
  const tpl = bookingRequestEmail({
    lenderName: listing.owner.display_name,
    renterName: /* from findEmailById(renterId) */,
    listingTitle: listing.title,
    startDate: booking.start_date,
    endDate: booking.end_date,
  });
  await sendEmail({ to: listing.owner.email, ...tpl });
}
```

**`confirmBooking()`** — email to renter:
```ts
const renter = await usersRepository.findEmailById(booking.renter_id);
if (renter?.email) {
  const tpl = bookingConfirmedEmail({
    renterName: renter.display_name,
    listingTitle: listing?.title ?? '',
    lenderName: listing?.owner.display_name ?? '',
    startDate: booking.start_date,
    endDate: booking.end_date,
  });
  await sendEmail({ to: renter.email, ...tpl });
}
```

**`rejectBooking()`** — email to renter:
```ts
const renter = await usersRepository.findEmailById(booking.renter_id);
if (renter?.email) {
  const tpl = bookingRejectedEmail({
    renterName: renter.display_name,
    listingTitle: listing?.title ?? '',
    startDate: booking.start_date,
    endDate: booking.end_date,
  });
  await sendEmail({ to: renter.email, ...tpl });
}
```

---

## Implementation Order Summary

```
Stage 1 (SSE global stream)  →  implement first — unblocks in-app notification UI
Stage 3 (Email / Resend)     →  do second — independent of Stage 2, 30 mins to wire up
Stage 2 (Web Push)           →  do last — most complex (service worker + DB table + VAPID)
```
