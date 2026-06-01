# StuFlux — Peer-to-Peer Rental Platform for Students

> Rent anything from your neighbors — cameras, tools, vehicles & more.

## What Is This?

StuFlux is a peer-to-peer rental marketplace built for a city. Think Airbnb, but for stuff — cameras, instruments, tools, equipment , etc. Users list items they own, other users rent them for daily rates, and they communicate via built-in messaging and book items.

## Current Status (May 2026)

### ✅ Done

| Area | Status | Notes |
|------|--------|-------|
| **Monorepo setup** | ✅ Complete | pnpm workspaces, concurrently for dev |
| **API — Auth** | ✅ Complete | Clerk integration, webhook sync, JWT verification |
| **API — Users** | ✅ Complete | Profile (GET/PUT `/me`), auto-sync from Clerk |
| **API — Listings** | ✅ Complete | Full CRUD, browse with filters, owner listings |
| **API — Categories** | ✅ Complete | Seeded categories, GET endpoint |
| **API — Uploads** | ✅ Complete | Cloudinary signature + complete flow |
| **API — Bookings** | ✅ Complete | Create, confirm, reject, list, availability check |
| **API — Messaging** | ✅ Complete | Conversations, messages, SSE streaming, mark seen |
| **API — Webhooks** | ✅ Complete | Clerk user.created/updated sync |
| **API — Error handling** | ✅ Complete | Centralized handler, AppError class, Zod validation |
| **API — Tests** | ⚠️ Partial | Messaging tests exist, others TBD |
| **Frontend — Scaffold** | ✅ Complete | Next.js 16 + Clerk auth + Tailwind v4 |
| **Frontend — Auth pages** |  ⚠️ Partial | Sign-in, sign-up via Clerk components |
| **Shared types** | ✅ Scaffolded | `packages/types` exists but minimal |

### 🔲 TODO

| Area | Priority | Notes |
|------|----------|-------|
| **Frontend — Home and Browse page** | 🔴 High | Currently still default Next.js boilerplate |
| **Frontend — Listing detail page** | 🔴 High | View listing, photos, booking CTA |
| **Frontend — Create/Edit listing** | 🔴 High | Form with image upload |
| **Frontend — My listings dashboard** | 🔴 High | Owner's listing management |
| **Frontend — Booking flow** | 🔴 High | Date picker, confirmation, status tracking |
| **Frontend — Messaging UI** | 🟡 Medium | Conversation list + chat with SSE |
| **Frontend — Profile page** | 🟡 Medium | View/edit profile |
| **Frontend — Design system** | 🔴 High | Colors, typography, component library |
| **API — Reviews system** | 🟡 Medium | Branch exists (`feature/reviews-system`) but not merged |
| **Deployment** | 🟡 Medium | Not configured yet |
| **API — More test coverage** | 🟢 Low | Expand beyond messaging tests |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Monorepo** | pnpm workspaces | pnpm 8.x |
| **Frontend** | Next.js (App Router) | 16.0.1 |
| **Frontend styling** | Tailwind CSS | v4 |
| **Frontend UI primitives** | Radix UI | Various |
| **Frontend API client** | ky | 1.13 |
| **Auth** | Clerk | @clerk/nextjs 6.x |
| **Backend** | Express | 5.x |
| **Database** | PostgreSQL + Drizzle ORM | Drizzle 0.44 |
| **File storage** | Cloudinary | 2.x |
| **Validation** | Zod | 4.x |
| **Language** | TypeScript | 5.x |
| **Testing** | Jest + Supertest | Jest 30 |

## Repository

- **Monorepo root**: `stuFlux/`
- **Main branch**: `main` (stable baseline)
- **Development branch**: `develop` (active work)
- **Current working branch**: `experimental`
- **Package manager**: pnpm (`pnpm install` from root)
- **Dev command**: `pnpm dev` (runs API :4000 + Web :3000)

## Team Context

- Academic project with a tight deadline
- "Design-in-code" approach — no Figma, reference existing apps (FoodPanda, etc.) and build directly
- Mobile-first, GenZ-focused aesthetic
- Design references stored in `docs/design-refs/`
- **Visual DNA System**: Follow the [VISUAL_DNA.md](./VISUAL_DNA.md) for all styling, theme, and aesthetic decisions.
