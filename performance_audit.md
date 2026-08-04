# Completed Analysis
- **Files inspected**: 
  - `apps/web/src/app/listings/page.tsx`
  - `apps/web/src/app/profile/page.tsx`
  - `apps/web/src/lib/listings/api.ts`
  - `apps/api/src/modules/listings/infrastructure/repository.ts`
  - `apps/api/db/schema.ts`

- **Performance bottlenecks found**:
  1. **Sequential API Calls (Frontend)**: In `apps/web/src/app/listings/page.tsx`, `fetchOwnerListings` and `fetchOwnerBookings` are awaited sequentially. This doubles the network time for data fetching.
  2. **Sequential API Calls (Frontend)**: In `apps/web/src/app/profile/page.tsx`, fetching reviews `users/${profile.id}/reviews` waits for the `profilePromise` to resolve first, adding an unnecessary network waterfall.
  3. **Missing Database Indexes**: The schema (`apps/api/db/schema.ts`) lacks indexes for heavily queried foreign keys. Specifically:
     - `listings.owner_id` (used by `listings/owner/my`)
     - `bookings.owner_id` (used by `bookings?role=owner`)
     - `bookings.renter_id` (used by `bookings?role=renter`)
     - `listing_photos.listing_id` (used in joins when fetching listings)
     Without these, PostgreSQL performs sequential scans, which become extremely slow as the tables grow.

- **Root cause of the slow rendering**:
  The primary root cause of the latency is the combination of **sequential data fetching** (waterfalls) in the React Server Components and **missing database indexes** on foreign keys which slows down the API responses for `findByOwner` and booking queries.

- **Completed tasks (✅)**:
  - ✅ Codebase analysis of My Listings and Profile pages.
  - ✅ Inspection of data fetching logic in frontend.
  - ✅ Inspection of SQL queries and schema in backend.

# Pending Optimizations
- **Remaining issues**:
  - The sequential fetching needs to be parallelized using `Promise.all()`.
  - Drizzle schema needs index declarations.
  - The database requires these indexes to be created/pushed.

- **Planned optimizations (⏳)**:
  - ⏳ Refactor `apps/web/src/app/listings/page.tsx` to use `Promise.all` for `fetchOwnerListings` and `fetchOwnerBookings`.
  - ⏳ Refactor `apps/web/src/app/profile/page.tsx` to parallelize the reviews fetch if possible, or create a `users/me/reviews` endpoint to avoid the sequential dependency.
  - ⏳ Add indexes to `apps/api/db/schema.ts` (`owner_id` on listings, `listing_id` on photos, `owner_id`/`renter_id`/`listing_id` on bookings).
