# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│              Next.js 16 — App Router                 │
│         Clerk Auth · Tailwind v4 · Radix UI          │
│                  ky (API client)                     │
└─────────────┬─────────────────┬─────────────────────┘
              │ REST (JSON)     │ SSE (messages)
              ▼                 ▼
┌─────────────────────────────────────────────────────┐
│                Express 5 API (:4000)                 │
│             /api/v1/* — Module-based                 │
│     Helmet · CORS · Rate Limit · Compression         │
│           Clerk JWT verify · Zod validation           │
└──────┬──────────────┬────────────────┬──────────────┘
       │              │                │
       ▼              ▼                ▼
┌────────────┐ ┌────────────┐  ┌─────────────┐
│ PostgreSQL │ │ Cloudinary │  │  Clerk API  │
│  (Drizzle) │ │  (Images)  │  │ (Webhooks)  │
└────────────┘ └────────────┘  └─────────────┘
```

## Monorepo Layout

```
stuFlux/
├── apps/
│   ├── api/          ← Express 5 backend
│   │   ├── db/       ← Schema, migrations, seeds
│   │   ├── src/
│   │   │   ├── main/       ← app.ts (Express config) + server.ts (bootstrap)
│   │   │   ├── config/     ← env, cors, helmet, rate limiter, validation
│   │   │   ├── common/     ← Shared errors (AppError, ErrorUtils)
│   │   │   ├── infra/      ← Infrastructure layer
│   │   │   │   ├── db/     ← Database connection
│   │   │   │   ├── events/ ← Event bus (SSE)
│   │   │   │   └── http/   ← Middleware (auth, errorHandler, logger)
│   │   │   ├── modules/    ← Feature modules (see below)
│   │   │   └── utils/      ← Utility functions
│   │   └── tests/          ← Jest + Supertest tests
│   │
│   └── web/          ← Next.js 16 frontend
│       └── src/
│           ├── app/        ← App Router pages
│           │   ├── auth/   ← sign-in/, sign-up/
│           │   └── ...     ← Other pages (TODO)
│           ├── lib/        ← Shared utilities
│           │   ├── api-client.ts  ← ky-based API client
│           │   ├── clerk-theme.ts ← Clerk appearance config
│           │   └── db.ts          ← Direct DB connection (server components)
│           └── middleware.ts      ← Clerk auth middleware
│
├── packages/
│   └── types/        ← Shared TypeScript types (minimal so far)
│
└── docs/             ← You are here
    └── design-refs/  ← UI reference screenshots
```

## API Module Structure

Each feature is a self-contained module under `src/modules/`:

```
modules/
├── health/       ← Health check (simple: controller + routes + service)
├── users/        ← User profile management
├── listings/     ← Item listings (uses Clean Architecture layers)
│   ├── application/     ← Use cases / business logic
│   ├── domain/          ← Domain models
│   ├── infrastructure/  ← Data access
│   └── interfaces/      ← HTTP layer (controller, routes, validations)
├── categories/   ← Category management
├── uploads/      ← Cloudinary upload flow
├── bookings/     ← Booking lifecycle
├── messages/     ← Conversations + real-time messaging (SSE)
└── webhooks/     ← Clerk webhook handlers
```

**Standard module files** (flat structure — most modules use this):
- `routes.ts` — Express Router with endpoint definitions
- `controller.ts` — Request handling, validation, response formatting
- `service.ts` — Business logic
- `repository.ts` — Database queries (Drizzle)
- `validations.ts` — Zod schemas for request validation
- `types.ts` — Module-specific TypeScript types
- `index.ts` — Re-exports routes

> **Note:** The `listings` module uses a layered architecture (application/domain/infrastructure/interfaces) while other modules use a flat structure. This inconsistency exists — stick with the **flat pattern** for new modules unless there's a strong reason for layers.

## Express Middleware Stack (Order Matters)

```
Request →
  1. helmet           (Security headers)
  2. cors             (CORS — allows localhost:3000 + production domain)
  3. compression      (gzip responses)
  4. express.json     (Parse JSON body, 10mb limit)
  5. express.urlencoded (Parse form data)
  6. rateLimiter      (Rate limiting)
  7. requestLogger    (Morgan logging)
  8. optionalAuth     (Extracts Clerk user if token present, never fails)
  9. → routes         (Module handlers)
  10. 404 handler     (Unmatched routes)
  11. errorHandler    (Centralized error handler — ALWAYS LAST)
```

## Auth Flow

### How It Works
1. **Frontend**: User signs in via Clerk's hosted UI components
2. **Frontend**: `useAuth().getToken()` gets a short-lived JWT from Clerk
3. **Frontend**: `api-client.ts` attaches `Authorization: Bearer <token>` to every API call
4. **API**: `optionalAuth` middleware verifies the JWT with Clerk's `verifyToken()`
5. **API**: If valid, attaches `req.auth = { userId (clerk ID), sessionId, claims }` to the request
6. **API**: `ensureUserSynced()` checks if the Clerk user exists in our DB; creates them if not

### Two Auth Middlewares
- **`optionalAuth`** — Applied globally. Extracts user if token present, silently continues if not. Used for routes where auth is nice-to-have (e.g., browsing listings)
- **`requireAuth`** — Applied per-route. Fails with 401 if no valid token. Used for protected routes (e.g., creating listings, booking)

### Clerk Webhooks
- `POST /api/v1/webhooks/clerk` receives `user.created` and `user.updated` events
- Syncs user data (email, name, avatar) to our `users` table

## Database

- **Engine**: PostgreSQL
- **ORM**: Drizzle ORM (SQL-like query builder, not Prisma-style)
- **Schema file**: `apps/api/db/schema.ts`
- **Migrations**: `apps/api/db/migrations/` (generated via `drizzle-kit generate`)
- **Seeds**: `apps/api/db/seeds/`

### Tables

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `users` | id (uuid), clerk_user_id, display_name, city | User profiles, synced from Clerk |
| `user_verifications` | user_id, phone_verified, verification_level | Verification status |
| `categories` | id (serial), name, slug, icon | Listing categories |
| `listings` | id (uuid), owner_id, title, category_id, daily_rate, city, status | Rental items |
| `listing_photos` | id (uuid), listing_id, url, position, is_primary | Photos for listings |
| `bookings` | id (uuid), listing_id, renter_id, owner_id, start/end_date, status | Booking records |
| `conversations` | id (uuid), listing_id, renter_id, owner_id | Chat threads (unique per listing+renter) |
| `messages` | id (uuid), conversation_id, sender_id, body | Individual messages |

### Key Relationships
- `listings.owner_id` → `users.id` (cascade delete)
- `bookings` links `listing_id`, `renter_id`, `owner_id` → respective tables
- `conversations` are unique per (listing_id, renter_id) pair
- `messages.conversation_id` → `conversations.id`
- All foreign keys use cascade delete

## Frontend Architecture

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 + `clsx` + `tailwind-merge` + `class-variance-authority`
- **UI Primitives**: Radix UI (Dialog, Select, Toast)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod resolvers
- **API calls**: `ky` (fetch-based HTTP client)
  - Client components: `useApiClient()` hook (auto-attaches Clerk token)
  - Server components: `createServerApiClient(token)` 
- **Image handling**: `browser-image-compression` for client-side compression, `sharp` for server-side

## Error Handling Pattern

The API uses a centralized error system:

```typescript
// Throw errors anywhere in service/controller code:
throw new AppError('Listing not found', 404, 'RESOURCE_NOT_FOUND');

// Or use the utility shortcuts:
throw ErrorUtils.notFound('Listing', listingId);
throw ErrorUtils.unauthorized('create_booking');
throw ErrorUtils.validation('Invalid date range');
```

All errors are caught by `errorHandler` middleware and returned as:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Listing not found",
    "timestamp": "...",
    "path": "/api/v1/listings/abc",
    "requestId": "req_..."
  }
}
```

In development mode, errors include extra debug info (stack trace, context, validation details).

## Real-Time Messaging (SSE)

- `GET /api/v1/conversations/:id/stream` opens a Server-Sent Events connection
- Client receives `message` events as they're sent by the other user
- No WebSocket/Socket.io — SSE is simpler and sufficient for 1:1 chat
