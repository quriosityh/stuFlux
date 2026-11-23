<div align="center">

  <img src="docs/design-refs/logo.png" alt="StuFlux Logo" width="160" />

  # StuFlux

  ### *A High-Performance, Community-Driven Peer-to-Peer Rental Platform*

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Express.js](https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
  [![Monorepo](https://img.shields.io/badge/Monorepo-pnpm_Workspaces-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
  [![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

  <p align="center">
    <strong>Monetize underutilized assets · Access expensive gear on-demand · Circular economy for urban communities</strong>
  </p>

  <p align="center">
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-key-engineering-highlights--trade-offs">Engineering Highlights</a> •
    <a href="#-core-features--state-machines">Core Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-monorepo-layout">Monorepo Layout</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api--error-handling-design">API Design</a>
  </p>

</div>

---

## 📌 Executive Summary

In dense urban centers like Lahore, Pakistan, accessing high-value, occasional-use assets (cameras, cinema lenses, pro audio equipment, drones, power tools, camping gear) forces students and creators into a binary compromise: **pay steep capital costs to buy items outright**, or **rely on risky, unstructured informal rentals** plagued by lack of accountability, opaque pricing, and nonexistent identity verification.

**StuFlux** bridges this trust deficit with an end-to-end, hyper-local peer-to-peer rental marketplace. Item owners safely monetize idle equipment, while verified renters access top-tier gear on-demand through structured calendar availability locks, real-time negotiation, and bidirectional reputation scoring.

Built from the ground up as a production-ready, TypeScript-first monorepo, StuFlux focuses on **low latency, zero double-booking concurrency guarantees, direct client-to-cloud asset pipelines**, and **real-time event streaming**.

---

## 🏗️ System Architecture

StuFlux decouples user interaction, business logic, asynchronous notifications, and persistence across a clean layered monorepo architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Next.js 16)                            │
│           App Router · React 19 · Tailwind CSS v4 · Radix UI · Framer Motion     │
│                 ky API Client · Browser Image Compression · Lucide Icons         │
└────────────────────────────┬─────────────────────────────┬───────────────────────┘
                             │ REST (JSON)                 │ Server-Sent Events (SSE)
                             ▼                             ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY (Express 5)                               │
│           Rate Limiter · Helmet Security · CORS · Gzip Compression               │
│               Clerk JWT Verification · In-Memory Pub/Sub Event Bus               │
│          Zod Boundary Validation · Centralized RFC-Compliant Error Handling      │
└────────────┬─────────────────────────────┬───────────────────────────┬───────────┘
             │ Drizzle ORM                 │ Signed Signatures         │ Webhooks
             ▼                             ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐   ┌──────────────────────┐
│   PostgreSQL Database   │   │     Cloudinary CDN      │   │    Clerk Auth API    │
│  • Normalized Schema    │   │  • Zero-API Bandwidth   │   │  • User Lifecycle    │
│  • Concurrency Checks   │   │  • Client Direct Upload │   │  • Session Tokens    │
│  • Temporal Overlap SQL │   │  • Auto Transformation  │   │  • JIT User Sync     │
└─────────────────────────┘   └─────────────────────────┘   └──────────────────────┘
             │
             ├──► In-App Notification Stream (SSE)
             ├──► Web Push Notifications (web-push VAPID)
             └──► Transactional Emails (Resend / Nodemailer)
```

```mermaid
flowchart TD
    subgraph Client["Next.js 16 Client (apps/web)"]
        UI[App Router & React 19]
        KY[ky HTTP Client + Clerk JWT]
        Compress[browser-image-compression]
    end

    subgraph Backend["Express 5 REST API (apps/api)"]
        MW[Security & Rate Limit Middleware]
        AuthMW[Optional / Required Clerk Auth]
        Controller[Feature Controllers]
        Service[Domain Services & Invariant Rules]
        Repo[Drizzle ORM Repositories]
        EventBus[In-Memory SSE Event Bus]
    end

    subgraph DataThirdParty["Persistence & Cloud Services"]
        PG[(PostgreSQL Database)]
        Cloudinary[(Cloudinary Media CDN)]
        ClerkSvc[(Clerk Auth Engine)]
        PushSvc[(Web Push & Resend Email)]
    end

    UI -->|Direct Upload with Signature| Cloudinary
    Compress -->|Optimized Blobs| UI
    UI -->|Authenticated REST Requests| KY
    KY --> MW --> AuthMW --> Controller --> Service --> Repo --> PG
    Service -->|Dispatch Message/Booking Events| EventBus
    EventBus -.->|Real-time SSE Stream| UI
    Service --> PushSvc
    ClerkSvc -->|Webhook Sync| Controller
```

---

## ⚡ Key Engineering Highlights & Trade-offs

### 1. Concurrency Control: Zero Double-Booking Guarantee
Rental marketplaces face the critical risk of concurrent booking collisions. StuFlux implements a multi-stage availability engine:
* **Temporal Interval Overlap Queries**: When a booking request is initiated, Drizzle executes an overlap query checking against existing `confirmed` bookings:
  $$\text{Overlap} \iff (\text{Start}_{\text{req}} < \text{End}_{\text{conf}}) \land (\text{End}_{\text{req}} > \text{Start}_{\text{conf}})$$
* **Owner Blockout Validation**: Checks against owner-designated maintenance/blackout dates before any booking state transition.
* **Optimistic Hold with Atomic Confirmation**: Multiple renters may submit inquiries (`pending`), but the moment an owner approves a booking, the system atomically locks the dates and invalidates competing overlapping requests.

### 2. Real-Time Chat via Server-Sent Events (SSE) instead of WebSockets
Rather than taking on the operational complexity and stateful socket management of WebSockets, StuFlux employs **Server-Sent Events (`text/event-stream`)** paired with an in-memory Pub/Sub event emitter:
* **The Trade-off**: 1:1 chat in rentals is primarily asynchronous negotiations followed by burst exchanges. SSE operates over standard HTTP, bypasses corporate proxy/firewall websocket drops, supports native browser auto-reconnect (`EventSource`), and avoids maintaining heavy persistent bi-directional socket servers.
* Client messages are dispatched via standard idempotent REST `POST` calls, while the server pushes new messages, typing activity, and read receipts down the SSE pipeline with zero handshake friction.

### 3. Zero-Server-Memory Direct Media Pipeline
Images are the lifeblood of P2P rental listings. Passing uncompressed image binaries through Express would quickly exhaust Node.js buffer memory and saturate API bandwidth:
* **Client-side Compression**: High-res smartphone captures (10MB+) are compressed in the browser via `browser-image-compression` down to `< 800KB` prior to transmission.
* **Pre-signed Cloudinary Authentication**: The client requests a cryptographically signed upload signature from `POST /api/v1/uploads/signature` (verified via Clerk).
* **Direct-to-Cloud Upload**: The client uploads directly to Cloudinary CDN using the one-time signature. Only the resulting secure URL and metadata are saved to PostgreSQL via the API.

### 4. Resilient Hybrid Auth: JIT Verification + Webhook Event Bus
To prevent stale state between Clerk and the primary database:
* **Gateway Token Verification**: The API verifies short-lived Clerk RSA JWTs on every protected request.
* **Just-In-Time (JIT) Sync Fallback**: If a verified user makes an API call before the webhook delivers, `ensureUserSynced()` creates or refreshes the local user entity in PostgreSQL on-the-fly.
* **Asynchronous Webhook Ingestion**: Webhooks (`user.created`, `user.updated`) process profile mutations asynchronously to maintain ultimate consistency.

### 5. Domain-Driven Clean Architecture
Core business modules follow strict dependency separation:
* **Interfaces / HTTP**: Validates input payloads using Zod schemas (`validations.ts`) and formats responses.
* **Application / Services**: Orchestrates business logic, sends notifications, coordinates repositories.
* **Domain Rules**: Pure business invariant functions (`assertPublishable`, `normalizePhotos`, specs size limits) completely decoupled from database mechanics or HTTP frameworks.
* **Infrastructure / Repositories**: Pure Drizzle SQL queries, relations, and type-safe schema mapping.

---

## 🎯 Core Features & State Machines

### 📅 Booking Lifecycle State Machine
Every rental item moves through a deterministic state machine that prevents invalid transitions:

```mermaid
stateDiagram-v2
    [*] --> Pending: Renter submits dates
    Pending --> Confirmed: Owner approves (Dates locked)
    Pending --> Rejected: Owner declines
    Pending --> Cancelled: Renter cancels
    Confirmed --> Active: Rental start date reached
    Confirmed --> Cancelled: Cancelled prior to start (Policies applied)
    Active --> Completed: Item returned & verified
    Completed --> Reviewed: Renter & Owner leave reviews
    Rejected --> [*]
    Cancelled --> [*]
    Reviewed --> [*]
```

### 🔍 Hyper-Local Discovery & Dynamic Geo Search
* **Neighborhood Search**: Native indexing for Lahore urban sectors (DHA, Gulberg, Model Town, Johar Town, Bahria Town, etc.).
* **Multi-Facet Filtering**: Filter by category, price per day ceiling, rental duration bounds, and area proximity.
* **Specifications Matrix**: Type-safe dynamic specifications (e.g., lens mounts for cameras, torque for drills) stored in PostgreSQL JSONB with strict byte-size safety caps (`assertSpecsSize`).

### 💬 Real-Time In-App Messaging
* Listing-specific conversation threads (`conversations` unique per `listing_id` + `renter_id`).
* In-chat rental offers and automated booking status update alerts.
* Read receipt tracking (`seen_at`) and live unread counters.

### 🌟 Two-Way Review & Trust System
* Renters rate owners on item condition, accuracy, and punctuality.
* Owners rate renters on equipment care and communication.
* Prevents platform abuse through verified-booking-only review gating.

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | Modern React Server & Client Components, file-system routing, SSR/SSG |
| **Frontend Library** | **React 19** | Latest concurrent rendering features, hooks, and transitions |
| **Styling & Design** | **Tailwind CSS v4** + Radix UI | Utility-first styling with accessible, unstyled UI primitives |
| **Animation & UX** | **Framer Motion** + Lucide React | Cyber-Fluid micro-interactions, layout transitions, and visual iconography |
| **HTTP Client** | **ky** | Lightweight fetch-based client with interceptors for automatic JWT injection |
| **Backend Runtime** | **Node.js (>= 18)** + **Express 5.1** | High-throughput REST API with native promise routing & modern middleware |
| **Language** | **TypeScript 5.x** | Full-stack end-to-end type safety across client, server, and shared packages |
| **Database & ORM** | **PostgreSQL 16** + **Drizzle ORM** | Relational SQL schema, atomic migrations, and compile-time type-safe queries |
| **Authentication** | **Clerk** | Hosted identity, biometric/passkey support, session tokens, webhook sync |
| **Cloud Media** | **Cloudinary** | Image transformation, optimization, and edge CDN delivery |
| **Validation** | **Zod 4.x** | Runtime boundary validation on incoming payloads, query parameters, and envs |
| **Notifications** | **Web-Push** + **Resend** | Browser push notifications and responsive transactional email alerts |
| **Testing** | **Jest 30** + **Supertest** | Integration and unit test coverage for routes, domain rules, and controllers |

---

## 📂 Monorepo Layout

```text
stuFlux/
├── apps/
│   ├── api/                           # Express 5 REST API Backend
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle ORM PostgreSQL schema
│   │   │   ├── migrations/            # Generated migration SQL files
│   │   │   └── seeds/                 # Sample seed data & demo accounts
│   │   ├── src/
│   │   │   ├── main/                  # Express bootstrap (app.ts, server.ts)
│   │   │   ├── config/                # Security (Helmet, CORS, Rate Limit)
│   │   │   ├── common/                # Standardized errors (AppError, ErrorUtils)
│   │   │   ├── infra/                 # DB pool, SSE event bus, Email, Push
│   │   │   └── modules/               # Domain feature modules
│   │   │       ├── bookings/          # Availability checks, booking lifecycle
│   │   │       ├── listings/          # Clean Architecture: domain, repos, use-cases
│   │   │       ├── messages/          # 1:1 chat conversations & SSE streaming
│   │   │       ├── reviews/           # Two-way rating & review engine
│   │   │       ├── notifications/     # Real-time notification streams
│   │   │       ├── uploads/           # Cloudinary cryptographic signature endpoint
│   │   │       ├── users/             # User profiles & sync mechanisms
│   │   │       └── webhooks/          # Clerk identity webhook handlers
│   │   └── tests/                     # Jest + Supertest integration suites
│   │
│   └── web/                           # Next.js 16 Frontend
│       ├── public/                    # Static assets & icons
│       └── src/
│           ├── app/                   # App Router pages (/listings, /bookings, etc.)
│           ├── components/            # Reusable UI & Radix design system components
│           ├── hooks/                 # Custom React hooks (useApiClient, useSSE)
│           └── lib/                   # API client (ky), Clerk theme, db client
│
├── packages/
│   ├── types/                         # Shared TypeScript interfaces & types
│   └── db/                            # Shared database schema utilities
│
├── docs/                              # Architecture, Design DNA, and setup guides
└── package.json                       # pnpm workspace root
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `>= 18.0.0`
* **pnpm**: `>= 8.0.0`
* **PostgreSQL**: Local instance running or hosted URI (Neon, Supabase, etc.)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/stuFlux.git
cd stuFlux
pnpm install
```

### 2. Configure Environment Variables

**Backend (`apps/api/.env`)**:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/stuflux
DATABASE_SSL=false
ALLOWED_ORIGINS=http://localhost:3000

# Clerk Auth
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Push & Email
RESEND_API_KEY=re_...
```

**Frontend (`apps/web/.env.local`)**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
```

### 3. Initialize Database & Seeds
```bash
# Push schema directly to database
pnpm -F api db:push

# Seed categories, mock listings, and demo test data
pnpm -F api db:seed
```

### 4. Start Development Server
```bash
pnpm dev
```
* **Frontend**: [`http://localhost:3000`](http://localhost:3000)
* **Backend API**: [`http://localhost:4000`](http://localhost:4000)
* **API Health Check**: [`http://localhost:4000/api/v1/health`](http://localhost:4000/api/v1/health)

---

## 🛡️ API & Error Handling Design

All API endpoints follow strict REST conventions, input validation with Zod, and uniform response formatting:

### Standardized Error Envelope
When an exception occurs anywhere in the stack, the centralized `errorHandler` catches it and serializes a predictable RFC-compliant JSON response:

```json
{
  "error": {
    "code": "BOOKING_DATES_UNAVAILABLE",
    "message": "The selected dates overlap with an existing confirmed booking.",
    "path": "/api/v1/bookings",
    "method": "POST",
    "timestamp": "2026-11-24T02:30:00.000Z",
    "requestId": "req_ck391j0al"
  }
}
```

### Key API Modules

| Module | Method & Route | Access | Description |
|---|---|---|---|
| **Listings** | `GET /api/v1/listings` | Public | Search listings with filters (category, area, query, price) |
| | `POST /api/v1/listings` | Authenticated | Create a new listing (draft or published) |
| | `GET /api/v1/listings/:id` | Public | Retrieve listing details, specifications, and owner profile |
| **Bookings** | `POST /api/v1/bookings` | Authenticated | Request a rental booking with date collision checks |
| | `PATCH /api/v1/bookings/:id/confirm` | Authenticated (Owner) | Confirm booking & lock calendar dates |
| | `PATCH /api/v1/bookings/:id/reject` | Authenticated (Owner) | Decline booking request |
| **Messages** | `GET /api/v1/conversations` | Authenticated | Retrieve active user conversations and unread counts |
| | `GET /api/v1/conversations/:id/stream` | Authenticated | **SSE**: Open real-time Server-Sent Events stream |
| | `POST /api/v1/conversations/:id/messages` | Authenticated | Send message into conversation & trigger SSE event |
| **Uploads** | `POST /api/v1/uploads/signature` | Authenticated | Generate cryptographically signed Cloudinary upload params |
| **Reviews** | `POST /api/v1/reviews` | Authenticated | Submit bidirectional review post-booking completion |

---

## 🧪 Testing & Code Quality

StuFlux maintains strict linting, type safety, and automated test pipelines:

```bash
# Run unit & integration test suites
pnpm test

# Run tests in watch mode
pnpm -F api test:watch

# Execute full monorepo type-check
pnpm type-check

# Run ESLint across all workspaces
pnpm lint
```

---

## 📈 Scalability & Future Roadmap

- [ ] **Escrow Payment Gateway**: Integration with Stripe / local Pakistani fintechs (JazzCash, Nayapay, SadaPay) with deposit holding.
- [ ] **Physical Equipment Verification**: QR-code handoff verification upon asset pickup and return.
- [ ] **Mobile App**: Cross-platform React Native / Expo mobile app sharing the `@stuflux/types` package.
- [ ] **AI-Powered Item Valuation**: Suggested daily rental pricing based on item model, age, and demand trends.


---

<div align="center">
  <p><sub>Built with passion for sustainable urban sharing, clean code, and resilient system design.</sub></p>
</div>
