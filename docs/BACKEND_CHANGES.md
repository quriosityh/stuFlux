# Listing Creation API & Schema Updates (V1)

This document details the backend changes required to support the finalized Listing Creation Flow.

## 1. Shared JSON Types (Frontend/Backend)
Instead of an `areas` DB table, we will use a shared JSON configuration.

**Location:** `packages/types/src/areas.ts`
```typescript
export interface Area {
  id: string;
  name: string;
  description?: string;
}

export const LAHORE_AREAS: Area[] = [
  { id: 'johar-town', name: 'Johar Town / LUMS', description: 'Near LUMS campus' },
  { id: 'gt-road', name: 'GT Road / UET', description: 'Near UET main campus' },
  { id: 'gulberg', name: 'Gulberg / Liberty', description: 'Central Lahore hub' },
  { id: 'dha', name: 'DHA / Cantt', description: 'Defence & Cantt area' },
  { id: 'model-town', name: 'Model Town' },
  { id: 'garden-town', name: 'Garden Town' },
  { id: 'township', name: 'Township' },
  { id: 'iqbal-town', name: 'Iqbal Town' },
  { id: 'wapda-town', name: 'Wapda Town' },
  { id: 'bahria-town', name: 'Bahria Town' },
];
```

## 2. Schema Changes (`apps/api/db/schema.ts`)

### Add `listing_blocked_dates` table
To support owner-managed availability, create a new table for manual blocked dates.

```typescript
export const listingBlockedDates = pgTable("listing_blocked_dates", {
    id: uuid("id").defaultRandom().primaryKey(),
    listing_id: uuid("listing_id")
        .notNull()
        .references(() => listings.id, { onDelete: "cascade" }),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

### Modify `listings` table
Update the existing listings table to remove `city` and `address`, and add the new fields.

```typescript
export const listings = pgTable("listings", {
    // ... existing fields (id, owner_id, title, description, category_id, daily_rate)
    
    // REMOVED: city: text("city").notNull(),
    // REMOVED: address: text("address"),
    
    // NEW: 
    area: text("area").notNull(), // Stores the area ID string from LAHORE_AREAS
    condition: text("condition", { 
        enum: ["like_new", "good", "fair", "well_used"] 
    }),
    rental_rules: text("rental_rules"), // Freeform text, max 1000 chars

    // ... existing fields (status, specs, min_rental_days, etc.)
});
```

## 3. API Route Changes

### Listings Module (`apps/api/src/modules/listings/`)

1. **`POST /listings` & `PUT /listings/:id`**
   - Update `createListingSchema` and `updateListingSchema` in `validations.ts` to expect `area` (string), `condition` (enum string), and `rental_rules` (string), and remove `city` and `address`.

2. **`GET /listings`**
   - Update `listFiltersSchema` to replace `city` with `area`.
   - Update the repository `find` method to filter by the new `area` column.

3. **`POST /listings/:id/blocked-dates`** (New Endpoint)
   - Allow owners to submit an array of `{ start_date, end_date }` to overwrite or add to their blocked dates.

4. **`GET /listings/:id/blocked-dates`** (New Endpoint)
   - Return manual blocked dates.

### Bookings Module (`apps/api/src/modules/bookings/`)

1. **`GET /bookings/listings/:id/availability`**
   - Currently, this fetches `confirmed` dates from the `bookings` table.
   - **Update:** It needs to also fetch dates from `listing_blocked_dates`, combine the two sets of unavailable dates, and return them as a unified list of blocked ranges.
