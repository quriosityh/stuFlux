# Decision Log

Append-only log of key technical decisions. Never delete old entries — mark them as superseded if they're replaced.

## Format

```
## DECISION-NNN: Title
**Date**: YYYY-MM-DD
**Status**: Accepted | Superseded by DECISION-XXX
**Context**: What was the situation?
**Decision**: What did we choose?
**Reasoning**: Why?
**Consequences**: What trade-offs?
```

---

## DECISION-001: Monorepo with pnpm Workspaces
**Date**: 2026-04-07  
**Status**: Accepted  
**Context**: Needed to decide repo structure for a full-stack app with shared types.  
**Decision**: Use a single monorepo with pnpm workspaces. Structure: `apps/api`, `apps/web`, `packages/types`.  
**Reasoning**: Simpler than multiple repos for a student team. Shared types package avoids duplication. pnpm is fast and handles workspaces well.  
**Consequences**: All team members work in one repo. Must use `pnpm -F <workspace>` for workspace-specific commands. Shared `node_modules` at root.

---

## DECISION-002: Clerk for Authentication
**Date**: 2026-04-07  
**Status**: Accepted  
**Context**: Needed auth that's fast to integrate with both Next.js and Express.  
**Decision**: Use Clerk for authentication. Frontend uses `@clerk/nextjs`, API verifies Clerk JWTs. Webhook syncs user data to our DB.  
**Reasoning**: Handles OAuth, magic links, session management out of the box. Official Next.js SDK. Free tier sufficient for development. Faster than building auth from scratch.  
**Consequences**: Dependent on Clerk service. Users table has `clerk_user_id` that maps to Clerk's user ID. Must maintain webhook endpoint for data sync. `ensureUserSynced()` provides fallback if webhooks fail.

---

## DECISION-003: Drizzle ORM over Prisma
**Date**: 2026-04-07  
**Status**: Accepted  
**Context**: Needed an ORM/query builder for PostgreSQL.  
**Decision**: Use Drizzle ORM with PostgreSQL.  
**Reasoning**: Lighter than Prisma, SQL-like API is closer to actual SQL (better for learning), no separate schema language (schema is TypeScript), faster cold starts. Drizzle Kit handles migrations.  
**Consequences**: Less auto-generated tooling than Prisma (no Prisma Studio equivalent built-in, though Drizzle Studio exists). Queries are more verbose but more transparent.

---

## DECISION-004: Express 5 for API
**Date**: 2026-04-07  
**Status**: Accepted  
**Context**: Needed a backend framework for the REST API.  
**Decision**: Use Express 5 with TypeScript (ESM).  
**Reasoning**: Team familiarity, massive ecosystem, mature and battle-tested. Express 5 adds native async error handling support.  
**Consequences**: Must use `.js` extensions in all imports (ESM requirement). Module-based routing keeps things organized. Middleware order matters (see ARCHITECTURE.md).

---

## DECISION-005: SSE over WebSocket for Messaging
**Date**: 2026-04-10  
**Status**: Accepted  
**Context**: Needed real-time message delivery for the chat feature.  
**Decision**: Use Server-Sent Events (SSE) instead of WebSocket or Socket.io.  
**Reasoning**: SSE is simpler server-side (just HTTP), sufficient for 1:1 chat where only server→client push is needed (client sends messages via POST). No extra library needed. Automatic reconnection built into browser's `EventSource` API.  
**Consequences**: One-directional only (server→client). If we need complex real-time features later (typing indicators, presence), we may need to upgrade to WebSocket. Works fine for current scope.

---

## DECISION-006: Cloudinary for File Uploads
**Date**: 2026-04-07  
**Status**: Accepted  
**Context**: Needed image storage for listing photos.  
**Decision**: Use Cloudinary with client-side direct upload (signed uploads).  
**Reasoning**: Free tier is generous. Built-in image transformations (resize, optimize). CDN delivery. Two-step upload flow (signature → upload → complete) keeps files off our server.  
**Consequences**: Dependent on Cloudinary service. Upload flow is slightly complex (3-step), but keeps API server lightweight.

---

## DECISION-007: ky over axios for Frontend API Client
**Date**: 2026-04-10  
**Status**: Accepted  
**Context**: Needed an HTTP client for the Next.js frontend to call our API.  
**Decision**: Use `ky` (fetch-based HTTP client) instead of axios.  
**Reasoning**: Smaller bundle, built on native fetch (better for Next.js), better TypeScript support, built-in retry logic, hook system for auth token injection.  
**Consequences**: API client pattern uses `ky.create()` with hooks. Team may be less familiar with ky vs axios. Two client variants: `useApiClient()` hook for client components, `createServerApiClient()` for server components.

---

## DECISION-008: Design-in-Code (No Figma)
**Date**: 2026-05-12  
**Status**: Accepted  
**Context**: Tight 2-week deadline, design-to-code friction was wasting time with AI tools.  
**Decision**: Skip Figma/design tools. Reference existing apps (FoodPanda, etc.) and build directly in code. Store reference screenshots in `docs/design-refs/`.  
**Reasoning**: Eliminates design handoff friction. AI coding agents work better with direct code than translating designs. Reference apps provide proven UX patterns for free.  
**Consequences**: No design source-of-truth outside the code. Must be disciplined about consistency. Design system emerges from code, not from a design file.
