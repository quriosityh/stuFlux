# StuFlux Notification System — Implementation TODOs

Three-stage implementation plan. Each stage is self-contained and must be completed
in order. Stages 1 and 2 are backend-only. Stage 3 requires a frontend service worker.

---

## Project Context (read before starting any stage)

**Stack:**
- Backend: Express.js + TypeScript, located at `apps/api/`
- Auth: Clerk (`requireAuth` middleware resolves `req.auth.userId` — this is the **Clerk user ID string**, NOT the internal UUID. The internal UUID is resolved by joining against the `users` table where `clerk_user_id = req.auth.userId`)
- ORM: Drizzle ORM with PostgreSQL (Neon). Client at `src/infra/db/client.ts`
- Module pattern: every module has `controller.ts`, `service.ts`, `repository.ts`, `routes.ts`, `validations.ts`, `index.ts`
- Module router is registered in `src/modules/index.ts`
- Frontend: Next.js, located at `apps/web/`

**Existing SSE infrastructure (per-conversation chat):**
- `src/infra/events/messageEmitter.ts` — exports `messageEmitter` (EventEmitter), `trackStream`, `untrackStream`, `isUserConnected`, `activeStreams`
- The conversation stream endpoint is `GET /conversations/:id/stream` in `src/modules/messages/controller.ts`
- It emits on channel `conversation:{conversationId}`
- Heartbeat: `:heartbeat\n\n` every 25 seconds to keep the connection alive
- On client disconnect (`req.on('close', ...)`) the listener is removed and the stream is untracked

**Existing booking service trigger points** (where notifications must be emitted):
- `src/modules/bookings/service.ts` → `createBooking()` — lender must be notified
- `src/modules/bookings/service.ts` → `confirmBooking()` — renter must be notified
- `src/modules/bookings/service.ts` → `rejectBooking()` — renter must be notified

**Existing message service trigger point:**
- `src/modules/messages/service.ts` → `sendMessage()` — the recipient of the message must be notified

---

## Stage 1 — Global User SSE Stream (In-App Notifications)

**Status: `TODO`**

### What this does
Opens a persistent SSE connection per authenticated user on app load. Emits real-time
notification events to that user from anywhere in the backend (booking events, new messages).
This is separate from and parallel to the existing per-conversation SSE stream — it does NOT
replace it.

### How it works
- Channel key: `user:{internalUserId}` (internal UUID from the `users` table, NOT the Clerk ID)
- One connection per logged-in user, opened once on app load and kept alive
- Heartbeat: `:heartbeat\n\n` every 25 seconds
- On disconnect: remove listener, untrack

### Notification event payload shape

All events on this stream share this envelope:
```ts
type NotificationEvent =
  | { type: 'booking_request';   bookingId: string; listingTitle: string; renterName: string;  startDate: string; endDate: string; conversationId: string; }
  | { type: 'booking_confirmed'; bookingId: string; listingTitle: string; lenderName: string;  startDate: string; endDate: string; conversationId: string; }
  | { type: 'booking_rejected';  bookingId: string; listingTitle: string;                      startDate: string; endDate: string; }
  | { type: 'new_message';       conversationId: string; senderName: string; preview: string; }
```

### Files to create

#### `src/infra/events/notificationEmitter.ts` (NEW)
Mirror the structure of `messageEmitter.ts` exactly. Create:
- `notificationEmitter` — a new `EventEmitter` instance (separate from `messageEmitter`, do NOT reuse it)
- `activeUserStreams` — `Map<string, Set<string>>` tracking `Map<internalUserId, Set<'connected'>>` (just a presence flag — one user, one stream)
- `trackUserStream(userId: string)` — adds userId to the map
- `untrackUserStream(userId: string)` — removes userId from the map
- `isUserStreaming(userId: string): boolean` — checks presence

#### `src/modules/notifications/` (NEW MODULE)
Create the following files:

**`controller.ts`**
- Export `streamNotificationsHandler` — an array `[requireAuth, asyncHandler(...)]`
- Inside the handler:
  1. Get `req.auth!.userId` (this is the Clerk ID string)
  2. Look up the internal user UUID: query the `users` table where `clerk_user_id = clerkId`. If not found, throw `AppError('User not found', 404, 'USER_NOT_FOUND')`
  3. Set SSE headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Call `res.flushHeaders()`
  4. Call `trackUserStream(internalUserId)`
  5. Start heartbeat interval every 25,000ms writing `:heartbeat\n\n`
  6. Register listener on `notificationEmitter` for channel `user:{internalUserId}` — writes `data: ${JSON.stringify(payload)}\n\n`
  7. On `req.on('close', ...)`: clear interval, remove listener, call `untrackUserStream(internalUserId)`

**`routes.ts`**
```ts
import { Router } from 'express';
import { streamNotificationsHandler } from './controller.js';
const router: Router = Router();
router.get('/notifications/stream', ...streamNotificationsHandler);
export default router;
```

**`index.ts`**
```ts
export { default } from './routes.js';
```

#### Register in `src/modules/index.ts`
Add:
```ts
import notificationsRoutes from './notifications/index.js';
// ...
apiV1.use('/', notificationsRoutes);
```

### Wire emission into existing services

#### `src/modules/bookings/service.ts`
Import `notificationEmitter` at the top.

In `createBooking()`, after the conversation is wired and the system message is posted, emit to the **lender**:
```ts
notificationEmitter.emit(`user:${listing.owner.internalId}`, {
  type: 'booking_request',
  bookingId: booking.id,
  listingTitle: listing.title,
  renterName: /* renter's display_name from users table */,
  startDate: booking.start_date,
  endDate: booking.end_date,
  conversationId: conversation.id,
});
```
> **Note:** `listingsRepository.findById()` already joins the owner. Inspect its return shape to get the owner's internal UUID and display name. For the renter's display name, query `users` where `id = renterId`.

In `confirmBooking()`, emit to the **renter**:
```ts
notificationEmitter.emit(`user:${booking.renter_id}`, {
  type: 'booking_confirmed',
  bookingId: booking.id,
  listingTitle: /* fetch from listing */,
  lenderName: /* fetch from users where id = booking.owner_id */,
  startDate: booking.start_date,
  endDate: booking.end_date,
  conversationId: /* find conversation by booking_id */,
});
```

In `rejectBooking()`, emit to the **renter**:
```ts
notificationEmitter.emit(`user:${booking.renter_id}`, {
  type: 'booking_rejected',
  bookingId: booking.id,
  listingTitle: /* fetch from listing */,
  startDate: booking.start_date,
  endDate: booking.end_date,
});
```

#### `src/modules/messages/service.ts`
In `sendMessage()`, after `messagesRepository.addMessage()` is called, emit to the **recipient** user's global stream in addition to the conversation stream (which already exists). Look up the recipient's internal UUID from the `users` table and emit:
```ts
notificationEmitter.emit(`user:${recipientInternalId}`, {
  type: 'new_message',
  conversationId: conversation.id,
  senderName: /* sender's display_name */,
  preview: data.body.trim().slice(0, 60),
});
```

### Frontend connection (Next.js — `apps/web/`)
In the root layout or a top-level client component that mounts once when the user is authenticated:
```ts
const es = new EventSource('/api/notifications/stream', { withCredentials: true });
es.onmessage = (e) => {
  const event = JSON.parse(e.data);
  // dispatch to global state / toast system based on event.type
};
// cleanup: es.close() on unmount
```

---

## Stage 2 — Web Push Notifications (Out-of-Tab, Browser-in-Background)

**Status: `TODO` — implement after Stage 1 is complete and working**

### What this does
Sends a native OS-level browser notification when the user has the tab closed but the
browser is still running. Uses the Web Push API with VAPID keys (free, no third party).

### Prerequisites
- Stage 1 must be complete
- The API server must be running HTTPS in production (Neon + Vercel/Railway handle this)
- Install `web-push` npm package in `apps/api/`: `npm install web-push` and `npm install -D @types/web-push`

### How it works
1. Generate a VAPID key pair once: `npx web-push generate-vapid-keys`. Store the public and private keys as env vars:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` = `mailto:your@email.com`
2. The frontend asks the user for notification permission and subscribes via the browser's Push API. The subscription object (contains endpoint URL + keys) is sent to the backend and stored in the DB.
3. When a notification event fires (same trigger points as Stage 1), the backend calls `webpush.sendNotification(subscription, payload)`.

### Database schema change
Add a `push_subscriptions` table to `apps/api/db/schema.ts`:
```ts
export const pushSubscriptions = pgTable('push_subscriptions', {
  id:      uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // The full PushSubscription JSON object from the browser
  endpoint: text('endpoint').notNull(),
  p256dh:   text('p256dh').notNull(),
  auth:     text('auth').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```
Write and run a migration after adding this.

### New API endpoints

**`POST /push/subscribe`** (authenticated)
- Body: `{ endpoint: string, keys: { p256dh: string, auth: string } }`
- Upsert the subscription for the current user (by internal user id). If the same endpoint already exists, update it. Use `onConflictDoUpdate` on the `endpoint` column (add a unique index on it).
- Returns `{ status: 'subscribed' }`

**`DELETE /push/subscribe`** (authenticated)
- Body: `{ endpoint: string }`
- Deletes the row matching the endpoint for the current user.

### Backend push sender utility
Create `src/infra/push/sender.ts`:
```ts
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
  internalUserId: string,
  payload: object,
): Promise<void> {
  // Query all push_subscriptions for this user
  // For each subscription, call webpush.sendNotification()
  // If webpush throws a 410 (Gone) or 404 error, the subscription is expired — delete it from the DB
  // Do NOT throw if sending fails — log the error and continue
}
```

### Wire into existing services
In `bookings/service.ts` and `messages/service.ts`, after emitting to `notificationEmitter`
(Stage 1), also call `sendPushToUser(recipientInternalId, payload)`. The payload for push
must be a JSON string — the service worker on the frontend will parse it.

Push payload shape (keep it small — push has size limits ~4KB):
```ts
{ type: string; title: string; body: string; url: string; }
// Example:
{ type: 'booking_request', title: 'New Rental Request', body: 'Hassan Ali wants to rent your DSLR Camera', url: '/bookings' }
```

### Frontend service worker (`apps/web/public/sw.js`)
A minimal service worker that handles the `push` event:
```js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

Register the service worker and subscribe in a client component:
```ts
// 1. Register SW
const reg = await navigator.serviceWorker.register('/sw.js');
// 2. Subscribe
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
});
// 3. Send subscription to API
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify(sub),
  headers: { 'Content-Type': 'application/json' },
});
```
> `urlBase64ToUint8Array` is a standard utility — copy it from the web-push npm docs.

---

## Stage 3 — Email Notifications via Resend (Truly Offline)

**Status: `TODO` — implement after Stage 1 is complete. Can be done in parallel with Stage 2.**

### What this does
Sends a transactional email to the user's registered email address for the two highest-value
events: a new booking request (to the lender) and a booking confirmation or rejection (to the renter).
Does NOT send email for new chat messages — that would be too noisy.

### Service to use
**Resend** — [resend.com](https://resend.com). Free tier: 3,000 emails/month, 100/day.
No credit card required. Simple REST API, official `resend` npm SDK.

### Setup
1. Create a free Resend account at resend.com
2. Verify your sending domain OR use Resend's shared domain for testing (`onboarding@resend.dev`)
3. Generate an API key from the Resend dashboard
4. Add to `apps/api/.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   RESEND_FROM_ADDRESS=notifications@yourdomain.com
   ```
5. Install SDK: `npm install resend` in `apps/api/`

### Backend email sender utility
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
    // Log error but do NOT throw — email failure must never break the booking flow
    console.error('[email] Failed to send:', err);
  }
}
```

### Email templates
Write simple inline HTML strings. No template engine needed for MVP. Keep them minimal.

**Booking request email (to lender):**
```ts
export function bookingRequestEmail(params: {
  lenderName: string;
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  appUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `New rental request for "${params.listingTitle}"`,
    html: `
      <p>Hi ${params.lenderName},</p>
      <p><strong>${params.renterName}</strong> has requested to rent your item
         <strong>${params.listingTitle}</strong> from ${params.startDate} to ${params.endDate}.</p>
      <p><a href="${params.appUrl}/bookings">Review the request →</a></p>
      <p>— StuFlux</p>
    `,
  };
}
```

**Booking confirmed email (to renter):**
```ts
export function bookingConfirmedEmail(params: {
  renterName: string;
  listingTitle: string;
  lenderName: string;
  startDate: string;
  endDate: string;
  appUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Your booking for "${params.listingTitle}" is confirmed!`,
    html: `
      <p>Hi ${params.renterName},</p>
      <p>Great news! <strong>${params.lenderName}</strong> has confirmed your rental of
         <strong>${params.listingTitle}</strong> from ${params.startDate} to ${params.endDate}.</p>
      <p><a href="${params.appUrl}/bookings">View booking details →</a></p>
      <p>— StuFlux</p>
    `,
  };
}
```

**Booking rejected email (to renter):**
```ts
export function bookingRejectedEmail(params: {
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  appUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Rental request for "${params.listingTitle}" was declined`,
    html: `
      <p>Hi ${params.renterName},</p>
      <p>Unfortunately your rental request for <strong>${params.listingTitle}</strong>
         (${params.startDate} to ${params.endDate}) was not accepted.</p>
      <p><a href="${params.appUrl}/explore">Browse other listings →</a></p>
      <p>— StuFlux</p>
    `,
  };
}
```

### Wire into existing services
In `apps/api/src/modules/bookings/service.ts`:

- In `createBooking()`: after the notification emitter call (Stage 1), send email to `listing.owner.email` using `bookingRequestEmail()`
- In `confirmBooking()`: after the notification emitter call, fetch renter's email from `users` table, send using `bookingConfirmedEmail()`
- In `rejectBooking()`: after the notification emitter call, fetch renter's email from `users` table, send using `bookingRejectedEmail()`

**Critical:** All email calls must be fire-and-forget (`await` is fine but wrap in try/catch that only logs — never let email failure propagate up as an API error). The `sendEmail` utility already handles this.

### APP_URL env var
Add to `.env`:
```
APP_URL=https://yourdomain.com
```
Use this when constructing the link in email templates. In development use `http://localhost:3000`.

---

## Implementation Order Summary

```
Stage 1 (SSE)        → Do first. Unblocks all in-app notification UI.
Stage 3 (Email)      → Do second. Independent of Stage 2. Resend setup is 15 mins.
Stage 2 (Web Push)   → Do last. Most complex (service worker + DB table + VAPID setup).
```
