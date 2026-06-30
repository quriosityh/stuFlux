# Page Structures

This document defines the finalized layout and section architecture for each page in the StuFlux application. It supplements `NAVIGATION.md` (which covers the nav shell) and `VISUAL_DNA.md` (which defines the design system).

> **Rule:** Every time a page layout is finalized or a section is locked in, it must be documented here. This is the source of truth for page composition.

---

## Home / Explore Page (`/`)

**Status:** ✅ Layout Finalized — 2026-05-17

### Concept

The Home and Explore pages are the **same route** (`/`). This is the marketplace feed and the first screen any user sees. It functions as both a landing page and the primary discovery tool.

The page is a **single vertical scroll** on mobile. Desktop gets a wider content container with a 3-column listing grid.

### Section Map

```
┌─────────────────────────────────────────────────────────┐
│  [1] Navigation Bar (DesktopNav / MobileNav — existing) │
├─────────────────────────────────────────────────────────┤
│  [2] HERO SEARCH ZONE                                   │
│       H1 tagline · Oversized pill search input · City   │
├─────────────────────────────────────────────────────────┤
│  [3] CATEGORY QUICK-FILTER STRIP                        │
│       Horizontal scroll of pill chips (emoji + label)   │
├─────────────────────────────────────────────────────────┤
│  [4] SOCIAL PROOF MICRO-STRIP                           │
│       "2,400+ items listed · 600+ students" trust stats │
├─────────────────────────────────────────────────────────┤
│  [5] ACTIVE FILTER BAR  (conditional — visible only     │
│       when filters are applied)                         │
│       Applied filter pills + "Clear all"                │
├─────────────────────────────────────────────────────────┤
│  [6] LISTING GRID                                       │
│       Mobile: 1-col · Tablet: 2-col · Desktop: 3-col   │
│       Each cell = <ListingCard />                       │
├─────────────────────────────────────────────────────────┤
│  [7] LOAD MORE TRIGGER                                  │
│       "Load More" .liquid-button (V1) · Infinite scroll │
│       sentinel (V2)                                     │
└─────────────────────────────────────────────────────────┘
```

### Section Specifications

#### [2] Hero Search Zone
- **H1:** Syne font, `text-4xl md:text-6xl`, gradient clip text using `--liquid-gradient`
- **Search Input:** `.chrome-card` + `rounded-full`, 2px border with accent glow on focus
- **City Selector:** `.glass-spotlight` pill, dropdown; defaults to "All Cities"
- **Background:** Two large blurred ambient gradient blobs using `bg-accent` at low opacity
- **API:** Search/city values fed directly into `GET /listings?search=&city=` query params

#### [3] Category Quick-Filter Strip
- Container: `flex overflow-x-auto gap-2` with hidden scrollbar
- **Default chip:** `.glass-spotlight` pill style
- **Active chip:** `.liquid-button` gradient style + `scale(1.02)`
- **Data:** Fetched from `GET /categories`; "All" chip hardcoded at index 0
- API: `category` slug fed into `GET /listings?category=<slug>`

#### [4] Social Proof Micro-Strip
- Single slim horizontal row of static copy
- Copy: `"✦ 2,400+ items listed · ✦ 600+ student renters · ✦ Lahore's #1 student marketplace"`
- Style: `text-xs`, `text-foreground/60`, `✦` in `text-accent`
- **Static content — no API call needed**

#### [5] Active Filter Bar
- **Conditional:** Only renders when `search` OR `category` OR `city` filter is active
- Each active filter: `.glass-spotlight` pill with `✕` icon button
- "Clear all": `.tactile-glitch` text button, right-aligned
- Animated mount: `animate-in slide-in-from-top-2`

#### [6] Listing Grid
- **Breakpoints:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Card component:** `<ListingCard />` (see component spec below)
- **Empty state:** Centered message + "Clear Filters" `.liquid-button`
- **Data:** `GET /listings` with active filter params

#### ListingCard Component Anatomy
```
┌─────────────────────────────┐
│  [Photo] (aspect-[4/3])     │  ← Cloudinary image, fallback gradient
├─────────────────────────────┤
│  [Category Badge] [$/day]   │  ← Category pill + price .liquid-button badge
│  Title (Syne, 2-line clamp) │
│  ★ Rating · 📍 City         │  ← Muted metadata row
│  [Avatar + Name]  [Rent It] │  ← Owner info + CTA
└─────────────────────────────┘
```
- Card: `.chrome-card rounded-2xl`
- Hover: `translateY(-4px)` + stronger `box-shadow`
- Click → routes to `/listings/:id`

#### [7] Load More
- **V1:** Centered `.liquid-button` "Load More Items ↓"
- **V2:** Replace with `IntersectionObserver` infinite scroll sentinel

### Component File Map

```
apps/web/src/
├── app/
│   └── page.tsx                     ← Orchestrator (will become ExploreClient wrapper)
└── components/
    └── explore/
        ├── HeroSearch.tsx           ← Section [2]
        ├── CategoryFilterStrip.tsx  ← Section [3]
        ├── SocialProofStrip.tsx     ← Section [4]
        ├── ActiveFilterBar.tsx      ← Section [5]
        ├── ListingGrid.tsx          ← Section [6] container + empty state
        ├── ListingCard.tsx          ← Individual card
        └── LoadMore.tsx             ← Section [7]
```

### State Architecture

```
page.tsx (or layout.tsx)
  └── ExploreClient.tsx ("use client")
        ├── state: { search, category, city, page }
        ├── effect: fetches GET /listings when state changes
        └── renders: HeroSearch → CategoryFilterStrip → SocialProofStrip
                     → ActiveFilterBar → ListingGrid → LoadMore
```

Filter state is synced to URL search params (`?search=&category=&city=`) for shareable links.

---

## Profile Page (`/profile`)

**Status:** ✅ Layout Finalized — 2026-06-09

### Concept

The Profile page acts as both the user's public-facing card and their owner dashboard. It presents high-level stats, active/inactive listings management, and profile settings in a clean, editorial layout.

### Section Map

```
┌─────────────────────────────────────────────────────────┐
│  [1] Navigation Bar (DesktopNav / MobileNav)            │
├─────────────────────────────────────────────────────────┤
│  [2] HERO CARD                                          │
│       Avatar · Display Name · Area Badge · Member Since │
│       Aggregated Stats (Listings, Lent, Rented)         │
├─────────────────────────────────────────────────────────┤
│  [3] MY LISTINGS SWITCHER (Tabs: Active / Inactive)     │
│       Active / Inactive count badges                    │
├─────────────────────────────────────────────────────────┤
│  [4] OWNER LISTINGS LIST                                │
│       Grid of <ListingOwnerCard /> components           │
│       Quick Actions (Edit, Delete, Availability, Pause) │
├─────────────────────────────────────────────────────────┤
│  [5] SETTINGS SECTION                                   │
│       Edit Profile Form (Name, Lahore Area Combobox)    │
│       Log Out Trigger                                   │
└─────────────────────────────────────────────────────────┘
```

### Section Specifications

#### [2] Hero Card
- **Layout:** Flex column on mobile, horizontal on desktop. Uses `.chrome-card` container.
- **Avatar:** Large rounded square icon with gradient backdrop and online status dot indicator.
- **Aggregated Stats:** Flex row of stat badges: Listings, Lent (Completed bookings as owner), Rented (Completed bookings as renter).

#### [3] My Listings Switcher
- Smooth pill-shaped tabs filtering listings dynamically between "Active" and "Inactive/Draft".

#### [4] Owner Listings List
- **ListingOwnerCard Anatomy:**
  - Thumbnail photo (fallback icon if empty).
  - Title, category badge, rate/day, and view count metadata.
  - Action footer:
    - **Edit:** Link to listing wizard.
    - **Availability:** Direct link to Step 6 of listing wizard.
    - **Pause/Resume:** Immediate toggle between active/inactive.
    - **Delete:** Opens modal confirmation to archive listing.

#### [5] Settings Section
- **Edit Profile Form:** Dynamic panel editing display name and Lahore area. Combobox autocompletes against Lahore area JSON database.
- **Log Out:** Clerk logout trigger.

### Component File Map

```
apps/web/src/
├── app/
│   └── profile/
│       └── page.tsx                     ← Server orchestrator (Clerk auth check & fetch)
└── components/
    └── profile/
        ├── ProfileClient.tsx            ← Layout, state, tabs & actions handler
        ├── ListingOwnerCard.tsx         ← Individual listing card with actions
        ├── EditProfileForm.tsx          ← Profile editor + Lahore Area search combobox
        └── useSignOut.ts                ← Custom sign out hook wrapping Clerk
```

---

## Other Pages (TODO)

These pages are not yet designed. Update this document as layouts are finalized.

| Page | Route | Status |
|------|-------|--------|
| Listing Detail | `/listings/:id` | 🔲 In progress |
| Create/Edit Listing | `/listings/new` or `/listings/:id/edit` | ✅ Completed |
| Inbox | `/inbox` | 🔲 Not started |
| Activity (Bookings) | `/activity` | 🔲 Not started |
| Profile | `/profile` | ✅ Completed |
