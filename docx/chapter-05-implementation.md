# Chapter 5 — Implementation

---

## 5.1 Development Environment

| Tool / Technology | Purpose |
| :--- | :--- |
| VS Code | Primary code editor |
| Git / GitHub | Version control and collaboration |
| GitHub Actions | CI/CD pipeline (lint + build checks) |
| Postman | API endpoint testing |
| Drizzle Studio | Visual database inspection |
| Neon.tech Console | PostgreSQL database management |
| Cloudinary Dashboard | Image storage monitoring |
| Clerk Dashboard | User authentication management |

**Local Setup:**

- Node.js 20.x (LTS)
- pnpm (monorepo package manager)
- PostgreSQL connection via Neon.tech (serverless, no local DB needed)
- Environment variables managed via `.env.local`

---

## 5.2 Modules Implemented

### 5.2.1 Authentication Module

Implemented using **Clerk**. Handles:

- Email/password sign-up and login
- Google OAuth social login
- JWT session tokens (24-hour expiry)
- Middleware protecting private routes in Next.js App Router

On first login, a webhook syncs the Clerk user to the `users` table in PostgreSQL via an Express.js endpoint.

---

### 5.2.2 Listing Management Module

Multi-step listing creation form built with `react-hook-form` + `Zod` validation.

**Steps:**
1. Basic info (title, category, description)
2. Pricing (daily rate, deposit)
3. Photos (multi-image upload to Cloudinary)
4. Review and publish (draft → active)

Owners can edit, deactivate, or delete their listings from the dashboard. Images are compressed and stored on Cloudinary; only the `public_id` and `url` are saved to the database.

---

### 5.2.3 Search & Discovery Module

Implemented as Next.js Server Components for fast, cached reads.

**Features:**
- Keyword search on listing title and description (PostgreSQL full-text search)
- Filter by category, city, and price range
- Sort by newest or price
- Pagination (12 listings per page)

---

### 5.2.4 Booking Module

Implemented via Express.js API with full transaction support.

**Booking flow:**
1. Renter selects dates on the availability calendar
2. System checks for conflicts in the `bookings` table
3. Pricing is calculated: `daily_rate × (end_date − start_date)`
4. Pending booking is created; owner is notified
5. Owner confirms or rejects within 48 hours
6. On confirmation, dates are blocked in the calendar

Status lifecycle: `pending → confirmed / rejected → completed`

---

### 5.2.5 Messaging Module

Real-time messaging using **Server-Sent Events (SSE)** managed by a singleton `SSEHub`.

- Each conversation is tied to a listing (owner + renter pair)
- Messages are persisted to the `messages` table immediately
- SSE pushes new messages to connected clients without polling
- Message history is loaded on conversation open

---

### 5.2.6 Review Module

Post-rental review system with a blind reveal pattern:

- Both parties can submit a rating (1–5 stars) + optional text after booking completion
- Reviews are hidden until both submit, or after 14 days (auto-publish)
- Aggregate ratings are computed and displayed on user profiles and listings

---

## 5.3 Screenshots

> *Note: Screenshots reference the interface described in Chapter 4 (Section 4.4.1).*

| Screen | Description |
| :--- | :--- |
| Login / Sign-Up | Clerk-powered auth modals with Google OAuth option |
| Homepage | Hero section with category browse grid and featured listings |
| Listings Grid | Filterable, paginated card grid with price and category info |
| Listing Detail Page | Photo gallery, description, booking calendar, lender profile |
| Booking Calendar | Interactive date picker with blocked/available date highlighting |
| Messaging Interface | Conversation list sidebar + real-time chat thread |
| Dashboard | Owner's listing management with status controls |
| Review Form | Post-rental star rating and text feedback form |

---

## 5.4 Key Code Snippets

### Booking Conflict Check (Express.js)

```typescript
// Check for overlapping confirmed bookings
const conflicts = await db
  .select()
  .from(bookings)
  .where(
    and(
      eq(bookings.listingId, listingId),
      eq(bookings.status, "confirmed"),
      lte(bookings.startDate, endDate),
      gte(bookings.endDate, startDate)
    )
  );

if (conflicts.length > 0) {
  return res.status(409).json({ error: "Dates are not available" });
}
```

### SSE Message Delivery (Express.js)

```typescript
// Singleton SSE hub — sends message to connected clients in a conversation
sseHub.send(conversationId, {
  type: "new_message",
  payload: savedMessage,
});
```

### Listing Search (Next.js Server Action)

```typescript
const results = await db
  .select()
  .from(listings)
  .where(
    and(
      eq(listings.status, "active"),
      ilike(listings.title, `%${query}%`),
      categoryId ? eq(listings.categoryId, categoryId) : undefined
    )
  )
  .orderBy(desc(listings.createdAt))
  .limit(12)
  .offset((page - 1) * 12);
```

---

## 5.5 Chapter Summary

This chapter covered the practical implementation of StuFlux across six core modules: authentication, listings, search, booking, messaging, and reviews. Each module was built following the architecture defined in Chapter 4, using Next.js Server Components for read-heavy operations and Express.js for transactional writes. The development environment was kept lightweight, relying on cloud-managed services (Neon.tech, Cloudinary, Clerk) to avoid local infrastructure overhead.
