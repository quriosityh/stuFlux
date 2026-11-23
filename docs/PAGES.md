# StuFlux — Page & Navigation Design

> **Source of Truth** for page composition, functional specs, and UX flows.
> Locked design decisions only.

---

## 1. Global Navigation (5 Tabs)

 StuFlux uses a **mobile-first 5-tab bottom navigation bar** (floating translucent pill card). On desktop, this adapts to a fixed top header.

| Tab | Icon | Purpose | Primary hat |
| :--- | :--- | :--- | :--- |
| **Explore** | 🔍 | Discover items to rent (search, categories, browse) | Dual |
| **Bookings** | 📅 | Active deals, requests, and current rentals | Dual (Split tabs) |
| **Listings** | 📦 | Storefront manager (inventory, editing, pricing) | Lender |
| **Inbox** | 📥 | Peer-to-peer messaging threads | Dual |
| **Profile** | 👤 | Public identity, trust rating, history, earnings dashboard(light)and settings | Dual |

---

## 1.1 Explore Tab (`/` or `/explore`)

The primary marketplace storefront. Dynamically switches between casual discovery and high-intent search modes.

### A. Dual Operating Modes
1.  **Discovery Mode** *(Default)*:

    The home feed is composed of ordered horizontal carousel sections. Each section is independently fetched and rendered. Sections with zero results are silently hidden — no empty states, no placeholders.

    #### Feed Section Order

    ```
    ┌─────────────────────────────────────────────┐
    │  [Top Category Strip — ]              │
    ├─────────────────────────────────────────────┤
    │  📍 Gulberg & Nearby            [→ See all]   │  ← Conditional (area-resolved only)
    │  [Card] [Card] [Card] [Card] ──────────→    │
    ├─────────────────────────────────────────────┤
    │  🔥 Trending                  [→ See all]   │  ← Always visible
    │  [Card] [Card] [Card] ─────────────────→    │
    ├─────────────────────────────────────────────┤
    │  ✨ New Arrivals              [→ See all]   │  ← Always visible
    │  [Card] [Card] [Card] ─────────────────→    │
    ├─────────────────────────────────────────────┤
    │  ⚡ Power & Energy            [→ See all]   │  ← 8 category carousels
    │  📷 Cameras & Creators        [→ See all]   │
    │  🔧 Tools & Home Fix          [→ See all]   │
    │  ...                                        │
    ├─────────────────────────────────────────────┤
    │  [How It Works]                             │  ← Bottom: onboarding & lender CTA
    │  [Have items? Start lending →]              │
    └─────────────────────────────────────────────┘
    ```

    ---

    #### Section 1 — "[Area] & Nearby" *(Conditional)*

    Surfaces listings from the user's neighbourhood and its immediate surroundings. Uses the existing `getNearbyAreas(areaId, areas, radiusKm=3)` utility in `packages/types/area-search.ts` to compute a set of area ids, then queries listings across all of them.

    **Area Resolution — Priority Chain (first match wins):**

    | Priority | Source | How |
    | :--- | :--- | :--- |
    | 1 | Last `WHERE` search selection | Saved to `localStorage` key `stuflux_last_area_id` on every area pick in the search bar |
    | 2 | `user.area` from profile | Read from `GET /me` when authenticated |
    | 3 | Nothing resolved | Row is hidden entirely. No prompt, no fallback carousel. |

    > **Decision:** No GPS. The platform uses user-selected, named areas exclusively. GPS adds permission friction on page load and creates a false precision mismatch since our dataset is area-level, not coordinate-level. The localStorage fallback means a user who searched "Johar Town" yesterday sees Johar Town proximity listings today — which is actually more useful than their home area.

    **Data:**
    - Resolve `anchorAreaId` from the priority chain.
    - Call `getNearbyAreas(anchorAreaId, allAreas, 3)` client-side (static dataset, zero network cost).
    - Collect the source area + all returned neighbour area ids.
    - `GET /listings?area=X` for each area id (or a multi-area variant if the API supports it), merge, deduplicate, limit to **12 cards**.
    - Sort by `sort=popular` within the merged set.

    **Label:** Dynamic — `"[Area Name] & Nearby"` (e.g. `"Gulberg & Nearby"`). Honest about what it shows — the anchor area plus its 3km neighbours. Never "Near Me" (implies GPS).

    **"See all" link:** Navigates to Search & Results Mode pre-filtered with the anchor area.

    ---

    #### Section 2 — "Trending" *(Always Visible)*

    Platform-wide trending listings. Based on a weighted composite of confirmed transaction and passive view signal, time-decayed to prevent stale listings dominating permanently.

    **Metric:**
    ```
    trending_score = (booking_count × 3) + (view_count × 1)
                     ─────────────────────────────────────────
                         days_since_created + 2
    ```
    - `booking_count × 3`: A confirmed booking is a strong trust signal, weighted 3×.
    - `view_count × 1`: Passive interest, weighted 1×.
    - `days_since_created + 2`: Time decay — keeps new listings competitive. `+2` prevents division-by-zero on day 0.

    > **Decision:** The existing `sort=popular` already approximates this. For MVP, verify whether the backend uses `booking_count` + `view_count` in its popular sort. If yes, use it directly. If not, the formula above is the target. A new API sort variant is not required for launch — `sort=popular` is the right parameter.

    **Data:** `GET /listings?sort=popular&limit=12&status=active`

    **Label:** `"Trending"`. Static — does not vary by user or area.

    **"See all" link:** Navigates to Search & Results Mode with `sort=popular`.

    ---

    #### Section 3 — "New Arrivals" *(Always Visible)*

    The newest active listings on the platform. Zero personalization logic. Rewards lenders who just posted (supply-side incentive) and gives returning users a reason to check back.

    **Metric:** `ORDER BY created_at DESC` where `status = 'active'` and listing has at least one photo.

    **Data:** `GET /listings?sort=newest&limit=12&status=active`

    **Label:** `"New Arrivals"`. Static.

    **"See all" link:** Navigates to Search & Results Mode with `sort=newest`.

    > **Decision:** "For You" (personalized recommendations) is explicitly deferred post-MVP. Cold-start problem makes it useless at launch — most users will have zero rental history. "Just Listed" fills the same visual slot and requires zero logic.

    ---

    #### Section 4 — Category Carousels *(Always Visible)*

    One horizontal carousel row per platform category, in fixed display order matching the Top Category Strip. Each row fetches the top 10 most popular active listings for that category.

    **Data:** `GET /listings?category_id=[id]&sort=popular&limit=10` (8 parallel requests, one per category).

    **Label:** Category icon + name (e.g. `"📷 Cameras & Creators"`).

    **"See all" link:** Triggers category filter in Search & Results Mode.

    > **Decision:** Categories with fewer than 3 listings hide their carousel row entirely. An empty or near-empty category carousel looks broken and signals low supply — it is better to not show it than to show 1 card in a scroll row.

    ---

    #### Section 5 — Onboarding & Lender CTA *(Bottom, Always Visible)*

    - **"How It Works"**: 3-step visual guide (Browse → Request → Collect). Serves as onboarding for first-time visitors.
    - **Lender CTA Banner**: `"Have items lying around? Start lending →"` — links to `/listings/new`.

    These sections are anchored to the **bottom** of the Discovery feed, after all carousels. They are informational, not transactional, and should not interrupt the browsing flow.

    ---

2.  **Search & Results Mode** *(Triggered via search or category selection)*:

    Activated when the user submits a search, picks a category from the strip, or taps a "See all" link from any carousel. The discovery feed is replaced by a full results grid with filtering controls.

    #### Layout
    *   **Desktop**: 2-column — narrow `FilterSidebar` on the left, `ListingGrid` (responsive multi-column) on the right.
    *   **Mobile**: Full-width `ListingGrid` with a sticky `[⚙ Filters]` button in the results header. Tapping opens the filter panel as a **bottom sheet**.
    *   **Results header**: Shows total count (`"124 results"`) and the active sort label. Tapping the count area on mobile opens the filter sheet.

    #### Active Filters Indicator
    The `[⚙ Filters]` button shows a count badge of how many filter groups are currently active (e.g. `Filters · 2`). A **`Clear all`** link appears inline next to the badge whenever any filter is active — one tap resets everything to defaults.

    ---

    #### Filter Groups (3 total — no more)

    **1. Sort**
    Controls result ordering. Rendered as 4 selectable chips (single-select, one always active).

    | Label | API param | Default |
    | :--- | :--- | :---: |
    | Trending | `sort=popular` | ✅ |
    | Newest | `sort=newest` | |
    | Price: Low to High | `sort=rate_asc` | |
    | Price: High to Low | `sort=rate_desc` | |

    > **`sort=popular` implementation:** Sorts by the weighted time-decay trending formula `(booking_count × 3 + view_count) / (days_since_created + 2)` as a raw SQL expression in `listings/infrastructure/repository.ts`.

    **2. Price Range**
    Two plain number inputs: `Min (Rs.)` and `Max (Rs.)`. Values entered in PKR, converted to paisa before sending (`min_rate`, `max_rate`). Applied on blur / Enter — no slider. Empty field = no bound on that side.

    **3. Delivery Available**
    A single toggle chip: `🚚 Delivery Available`. When active, appends `delivery_available=true` to the query. Off by default — no filter applied, shows all listings regardless of delivery.

    **4. Date Range**
    Carried from the `WHEN` segment of the search bar. When `start_date` and `end_date` are set, `GET /listings` excludes any listing with a `confirmed` booking or manually blocked date range that overlaps the selected window. Listings with only `pending` bookings in the range remain visible. The selected dates also pre-fill the booking calendar on the listing detail page.

    ---

    #### What is deliberately excluded from filters

    | Filter | Reason excluded |
    | :--- | :--- |
    | Condition | Users judge condition from photos, not filter chips. Adds complexity for near-zero usage. |
    | Area | Already set via the `WHERE` segment of the search bar. Not duplicated in the filter panel. |
    | Min / Max rental days | Too granular. A niche constraint that belongs on the listing detail page, not as a browse filter. |

    > **Decision:** Condition remains visible as a compact pill on listing cards in both Discovery Mode and Search & Results Mode for consistency and trust. It is not added as a filter chip, but it should not disappear between modes.


### B. Core Navigation & Search
*   **Top Category Strip**: Sticky horizontal pill strip featuring the 8 core platform categories for instant, zero-reload feed filtering.

### Platform Category Schema

These are the canonical categories. This table is the single source of truth — use the slug as the API `category_id` filter key and the icon name to resolve the Lucide icon component.

| # | Name | Slug | Icon | Items Included |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Power & Energy** | `power-energy` | `zap` | Generators, UPS units, solar lamps, extension setups, inverters |
| 2 | **Tools & Home Fix** | `tools-home-fix` | `wrench` | Power drills, ladders, pressure washers, paint rollers, tile cutters, measuring equipment |
| 3 | **Cameras & Creators** | `cameras-creators` | `camera` | DSLRs, lenses, tripods, ring lights, mics, audio interfaces, gimbal stabilizers, projectors |
| 4 | **Music & Audio** | `music-audio` | `music` | Guitars, keyboards, DJ controllers, amps, portable speakers, mics, audio mixers |
| 5 | **Clothing & Fashion** | `clothing-fashion` | `shirt` | Sherwani, lehenga, formal suits, cultural dress, accessories, jewellery sets |
| 6 | **Hosting & Party Essentials** | `hosting-party` | `party` | Speakers, projectors, decoration sets, fairy lights, serving dishes, crockery, lawn games |
| 7 | **Bikes & Boards** | `bikes-boards` | `bike` | Bicycles, e-scooters, skateboards, rollerblades, unicycles |
| 8 | **Travel & Outdoors** | `travel-outdoors` | `tent` | Tents, hiking backpacks, sleeping bags |

> **Display order is fixed.** The strip and all category carousels always render in the order above (1→8). Do not sort alphabetically or by listing count.

*   **Hyper-Fluid 3-Segment Search Bar (`Where | When | What`)**:
    A centralized floating pill bar with frosted-glass dropdown panels:
    *   **Where**: Autocomplete location search specifically for Lahore neighborhoods (e.g., *Gulberg*, *DHA*). Maps to `area=` filter param. Auto-advances to "When" upon selection.
    *   **When**: Interactive date-range calendar (`<AvailabilityCalendar />`) for selecting rental start and end dates. Selected dates are passed as `start_date` and `end_date` to `GET /listings`, which excludes listings with confirmed bookings or blocked dates that overlap the range.
    *   **What**: Live debounced keyword search (300ms) against listing `title`, `description`, and `category name` (`ILIKE` match). Maps to `q=` param. Results are not ranked by relevance — all matches are returned and sorted by the active sort order.


### C. Marketplace Listing Card (`ListingCard.tsx`)

```
┌──────────────────────────────────────────┐
│                                     [❤️]   │  ← overlay, top-right
│                                          │
│             [ Item Image ]               │
│               (4:3 Ratio)                │
│                                          │
│                                          │  ← condition pill, bottom-left overlay
├────────────────────────   ───────────────┤
│ DSLR Camera Kit                  rating `│  ← title rattting
│ 📍 Gulberg                        🚚     │  ← area + delivery icon
│ Rs. 2,500/day              8 rentals     │  ← price + social proof
└──────────────────────────────────────────┘
```

#### Image Zone (overlays on photo)
*   **Photo**: 4:3 aspect ratio, `object-fit: cover`. Micro-zoom on hover (`scale-105` transition).
*   **Top-Right — `[❤️]` Save Button**: Floating icon button, always visible. 1-tap toggle with spring animation. Saves to user's local wishlist.
*   **Bottom-Left — Condition Pill**: Translucent pill badge showing item condition. Always visible 
   
#### Info Strip (below image)
*   **Row 1 — Title**: Bold, single-line, truncated with ellipsis. Pulls from `listing.title`.
*   **Row 2 — Area + Delivery**:
    *   Left: `📍 [Area]` — pulls from `listing.area` (e.g. `📍 Gulberg`). Muted text.
    *   Right: `🚚` truck icon — **only rendered when `listing.delivery_available = true`**. No text, icon only. Absent when pickup-only to keep cards clean.
*   **Row 3 — Price + Social Proof**:
    *   Left: `Rs. X,XXX/day` — high-contrast, semibold. Pulls from `listing.daily_rate` (convert from paisa).
    *   Right: `· X rentals` — muted text. Pulls from `listing.booking_count`. **Hidden entirely when `booking_count = 0`** — an empty "· 0 rentals" is worse than nothing.

#### What is deliberately excluded from the card
| Field | Reason excluded |
| :--- | :--- |
| Security deposit | Creates price anxiety before the renter is even interested. Detail page only. |
| Min/max rental days | Edge-case constraint. Only relevant if user's dates don't fit. Detail page only. |
| View count | Not a trust signal for renters — only useful internally for trending logic. |
| Featured badge | **Not a platform feature. Removed entirely.** |
| Lender name/avatar | Carousel cards are item-first, not person-first. Person context belongs on the detail page. |

---

## 2. Listing Detail Page (`/listings/[id]`)

The full item view. The only page where a booking request can be initiated.

---

### A. Current Implementation — What Exists

Components render in this fixed order. Desktop: 2-column (main content left, booking card right). Mobile: single-column with a sticky bottom bar.

| # | Component | Status | Key notes |
| :- | :--- | :---: | :--- |
| 1 | **Breadcrumb + title actions** | ✅ Done | Desktop only. Category trail + listing title context. |
| 2 | **Photo gallery** | ✅ Done | Full-width, swipeable. Primary photo first. |
| 3 | **Listing meta block** (`ListingMeta`) | ⚠️ Partial | Shows area, rating, review count. Rating and review count are currently **hard-coded mock values** — not real data. |
| 4 | **Lender snapshot** (`LenderSnapshot`) | ✅ Done | Avatar, display name, city, relative join time (`formatDistanceToNow`),  |
| 5 | **Item highlights** (`ItemHighlights`) | ✅ Done | Delivery available / Pickup only, `min_rental_days`, security deposit. |
| 6 | **Description + specs** (`Description`) | ✅ Done | Show more/less toggle. Parses `Specs:` section from description text into a key/value grid if present. |
| 7 | **Availability calendar** (`AvailabilityCalendar`) | ✅ Done | Blocked/booked dates grayed out. Selected date range stored in parent state. |
| 8 | **Desktop booking card** | ⚠️ Partial | Rate, date pickers, price breakdown, deposit, total. CTA: `Check availability` or `Request to Rent`. **Booking action not yet wired to the confirmation sheet or POST /bookings.** |
| 9 | **Mobile sticky booking bar** | ⚠️ Partial | Rate + date summary. CTA: `Check Dates` or `Request`. No dates = scrolls to calendar. **Same gap as #8.** |
| 10 | **Reviews section** (`ReviewsSection`) | ❌ Mock | Cards with author, date, rating, comment. **Hard-coded mock data only.** Real API integration pending. |
| 11 | **Lender profile section** (`LenderProfile`) | ✅ Done | Extended lender context rendered below reviews. |

**Signals currently surfaced:** `daily_rate` · `area` · `delivery_available` · `min_rental_days` · `security_deposit` · `owner identity + tenure` · `availability calendar` · `selected date range` · `booking total estimate` · `rating (mock)` · `review count (mock)`

---

### B. Booking Request Flow — To Be Built

Target behaviour for the CTA buttons in components #8 and #9.

#### Step 1 — Date Selection *(calendar already works)*
User taps dates on `AvailabilityCalendar`. Confirmed bookings and manually blocked dates are non-selectable. Booking card / sticky bar updates live with the calculated total.

**Delivery / Pickup toggle** — shown in the booking card only when `listing.delivery_available = true`:
```
  ● Pick up from Gulberg          (free)
  ○ Get it delivered             +Rs. 300
```
- Default: Pickup.
- Area label pulled from `listing.area` and always named explicitly — *"Pick up from Gulberg"*, never just "Pickup". The area IS the pickup zone.
- Selecting Delivery adds `listing.delivery_fee` to the live total.
- Delivery = lender personally brings the item. Exact drop-off coordinated via chat after booking.

**Min / Max rental days guard** — if dates violate constraints, CTA stays disabled with inline error: *"Minimum rental is X days"*.

#### Step 2 — Confirmation Bottom Sheet
Slides up on `[Request to Rent]`. No page navigation — listing stays behind it.

```
┌──────────────────────────────────────┐
│  Confirm Your Request          [✕]   │
│                                      │
│  DSLR Camera Kit                     │
│  Jul 15 → Jul 18  ·  3 days          │
│  📍 Pick up from Gulberg             │  ← or "🚚 Lender delivers" if delivery
│                                      │
│  💰 Price Breakdown                  │
│  Rent (Rs 800 × 3 days)    Rs 2,400  │
│  Delivery Fee              Rs   300  │  ← only if delivery selected
│  Security Deposit (refund) Rs 1,500  │  ← only if security_deposit > 0
│  ─────────────────────────────────── │
│  Total Upfront Due          Rs 4,200 │
│                                      │
│  [        Send Request       ]       │
└──────────────────────────────────────┘
```
- No message field — keep it simple. Coordinate via chat after booking.
- Security deposit labelled `(refund)` to prevent confusion.

#### Step 3 — After Sending
- `POST /bookings` fires: `{ listing_id, start_date, end_date }`.
- Conversation thread **found or created** for the `(listing_id, renter_id)` pair.
- System event card posted to thread: `"📋 Booking request submitted · Jul 15–18 · Rs. 2,400"`.
- User navigated to **the Inbox conversation thread**.

> **Why Inbox, not Bookings?** Next action is waiting for the host. Chat shows the event, context panel shows `pending` status, renter can coordinate or cancel from there without extra navigation.

---

### C. Gaps — What's Missing or Broken

| Gap | Priority | Detail |
| :--- | :---: | :--- |
| **Booking flow not wired** | 🔴 High | Components #8 and #9 have the UI but the CTA does not trigger the confirmation sheet or `POST /bookings`. Steps 2 and 3 above need to be implemented. |
| **Condition badge not shown** | 🔴 High | `listing.condition` is in the payload but not displayed anywhere on the PDP. Should appear in the meta block — it is the primary item quality signal. |
| **Reviews are mock data** | 🔴 High | `ReviewsSection` is hard-coded. Real reviews API integration needed. Rating in `ListingMeta` is also mock. |
| **Delivery/Pickup toggle missing** | 🟡 Medium | `ItemHighlights` shows "Delivery available" as static text, but the booking card has no toggle. The toggle (and its effect on live total) needs to be added to the booking card. |
| **View count not surfaced** | 🟢 Low | `view_count` is in the payload. Optional to show on PDP — primarily a backend sorting signal. |

---

### Conversation Architecture — One Thread Per Booking

Each conversation thread maps **1 : 1 to either a booking or an open inquiry**.

#### Thread Types

| Type | `booking_id` | Phase | How it starts |
| :--- | :--- | :--- | :--- |
| **Inquiry thread** | `NULL` | `inquiry` | Renter taps "Message lender" from the listing page before picking dates. Only **one** inquiry thread is allowed per `(listing_id, renter_id)` pair (partial unique index). |
| **Booking thread** | `SET` | `pending` → `confirmed` → `ongoing` → `completed` | Created (or upgraded from the inquiry thread) the moment `POST /bookings` fires. One thread per booking, unlimited per renter–listing pair. |

#### Upgrade Flow (Inquiry → Booking)

When a renter submits a booking request:
1. `POST /bookings` creates the booking row.
2. The booking service calls `attachOrCreateConversation`:
   - If an **inquiry thread** already exists for `(listing_id, renter_id)` → it is **upgraded**: `booking_id` is set on it. The chat history is preserved.
   - Otherwise → a **new thread** is created with `booking_id` already set.
3. A system event card is posted automatically: `"📋 Booking request submitted · Jul 15–18 · Rs. 2,400"`.
4. The API response includes `conversation_id` → frontend navigates the renter directly to that thread.

#### Scenario Table

| Scenario | Result |
| :--- | :--- |
| Renter A messages lender before picking dates | Inquiry thread created (`booking_id = NULL`) |
| Renter A submits booking (Jul 15–18) | Inquiry thread upgraded → booking thread for that booking |
| Renter A books same listing again (Sep 5–10) | New booking thread created for the September booking |
| Renter A books Listing Y (different listing) | New thread (different listing) |
| Renter B books Listing X | New thread (different renter) |

#### Phase Derivation

Phase is **never stored** on the conversation — it is derived at read time from the linked booking's status:

```
booking_id IS NULL          → inquiry
booking.status = pending    → pending
booking.status = confirmed  → confirmed  (includes ongoing — driven by dates on the frontend)
booking.status = rejected   → rejected
booking.status = completed  → completed
```

**Context panel** always shows the booking linked to the current thread — there is only ever one booking per thread, so there is no ambiguity.


## 3. Bookings Tab (`/bookings`)


1. **Top navigation / breadcrumb layer**
   - Breadcrumb trail shown on desktop
   - Title actions shown on desktop

2. **Photo gallery / hero media**
   - Full-width listing photo gallery
   - The gallery uses the listing title as the page heading context

3. **Main content column (left side on desktop)**
   - Listing meta block
   - Lender snapshot
   - Item highlights
   - Description block
   - Availability calendar

4. **Booking surface (right side on desktop, bottom bar on mobile)**
   - Booking card on desktop
   - Sticky bottom booking bar on mobile

5. **Lower-page proof sections**
   - Reviews section
   - Lender profile section

### Section-by-section implementation

#### 1. Breadcrumb + title actions (desktop only)
Shown at the top of the page on desktop.

What it shows:
- Category breadcrumb
- Listing title context
- Page-level title actions

Purpose:
- Gives the user orientation within the marketplace and keeps the listing context clear.

---

#### 2. Photo gallery
This is the first major visual block and is always present.

What it shows:
- One or more listing photos
- A gallery experience with the listing title as the visual context

Purpose:
- Gives the renter immediate visual context before any text content.

---

#### 3. Listing meta block
Rendered by `ListingMeta` immediately after the gallery content.

What it shows:
- Listing title on mobile
- A compact stats grid with:
  - city / area icon and label
  - a rating display or `New` placeholder state
  - review count and label when review data is present

Implementation details:
- The component uses a two-row stats grid with divider lines.
- Review count is currently passed as a hard-coded value and rating is also hard-coded in the current PDP client.
- If review count is zero, the reviews section is omitted and the grid simplifies.

Purpose:
- Gives the user a compact summary of the listing’s local context and social proof.

---

#### 4. Lender snapshot
Rendered by `LenderSnapshot` immediately after the listing meta block.

What it shows:
- Owner avatar
- Owner display name
- City
- Relative join time

Implementation details:
- Uses the owner object from the listing payload.
- Join time is derived from `created_at` using `formatDistanceToNow`.

Purpose:
- Introduces the lender as a person and helps create trust before booking.

---

#### 5. Item highlights / logistics block
Rendered by `ItemHighlights`.

What it shows:
- Whether delivery is available or pickup only
- Minimum rental duration
- Security deposit state

Implementation details:
- `delivery_available` controls whether the UI says “Delivery available” or “Pickup only”.
- `min_rental_days` is shown as a text row.
- `security_deposit` is shown as either an amount or “No security deposit”.

Purpose:
- Surfaces the practical logistics and cost constraints before the user reaches the booking surface.

---

#### 6. Description block
Rendered by `Description`.

What it shows:
- The main description text
- A “Show more” / “Show less” interaction when the description is long
- Parsed specifications if the text includes a `Specs:` or `Specifications:` section

Implementation details:
- The component splits the content into main description text and parsed key/value specifications.
- If spec rows are found, they are shown in a separate boxed section titled “Product Specifications”.

Purpose:
- Gives the renter the item details and any technical or product context.

---

#### 7. Availability calendar
Rendered by `AvailabilityCalendar`.

What it shows:
- Interactive date picker / availability calendar
- Blocked dates from the availability data
- Selected date range state

Implementation details:
- Uses the `availability` prop supplied by the parent.
- The selected date range is stored in the parent component state.

Purpose:
- Enables the renter to evaluate availability for a target rental window.

---

#### 8. Desktop booking card
Rendered in the right column on desktop.

What it shows:
- Daily rate in large text
- `Pickup Date` and `Return Date` selection slots
- Price breakdown once dates are selected
- Security deposit line once dates are selected
- Total amount once dates are selected
- Primary CTA button: `Check availability` or `Request to Rent`

Implementation details:
- Uses a card with border, shadow, and rounded corners.
- The CTA is disabled until both dates are selected.
- The booking action is wired to the parent `PDPClient` handler.

Purpose:
- Gives the renter the booking decision surface on desktop without forcing them to scroll back up.

---

#### 9. Mobile sticky booking bar
Shown at the bottom of the screen on mobile.

What it shows:
- Daily rate
- Selected-date summary or “Per day” fallback
- CTA button that either says `Check Dates` or `Request`

Implementation details:
- The bar is fixed to the bottom of the viewport.
- It uses the same selected date state as the desktop booking card.
- If dates are not selected, the button scrolls the user to the availability section.

Purpose:
- Keeps the booking action accessible on mobile while preserving the same flow.

---

#### 10. Reviews section
Rendered below the main content area.

What it shows:
- Average rating summary
- Review count
- Review cards with author, date, rating, and comment
- A `Show all reviews` button

Implementation details:
- The section is currently powered by hard-coded mock review data in `ReviewsSection`.
- The average rating is calculated from the mock dataset.

Purpose:
- Provides social proof and reassurance after the user has already seen the core details.

---

#### 11. Lender profile section
Rendered at the bottom of the page after the reviews section.

What it shows:
- The owner’s public profile context
- Additional lender profile UI from `LenderProfile`

Purpose:
- Gives more context about the lender after the main item details have already been seen.

### Current signals actually shown on the PDP
The current PDP surfaces the following signals:

- price / daily rate
- area / city
- rating summary
- review count summary
- owner identity and joined time
- delivery / pickup state
- minimum rental duration
- security deposit
- availability calendar
- selected date range
- booking total estimate

### Signals still missing from the current PDP
The current implementation does not explicitly surface:

- condition as a visible trust badge near the header/meta area
- view count on the detail page
- a fully data-backed review experience rather than mock content

### Actual organization of the page
The current implementation is organized as:

1. visual gallery
2. summary/meta row
3. lender identity
4. logistics highlights
5. description/specs
6. availability calendar
7. booking surface
8. reviews
9. lender profile

This is the actual implementation order currently shipped in the app.

---

## 3. Bookings Tab (`/bookings`)


The **Transactional Command Center**. Handles all active agreements, negotiations, and post-rental review loops.

```
┌──────────────────────────────────────┐
│  BOOKINGS                            │
│  ┌─────────────────┬───────────────┐ │
│  │   Renting       │Renting Out    │  ← Sub-tabs
│  └─────────────────┴───────────────┘ │
└──────────────────────────────────────┘
```

### Sub-Tab A: Renting (Renter Hat)
Shows active coordinates for items the user is renting from others. Cards are **Item-First** (left-anchored item thumbnail) rather than User-First.

#### Card Pricing Formula:
*   On the card, we show **Total Rental Cost (Rent + Delivery Fee)**. If a security deposit exists, it is appended clearly next to it as `(+ Rs X deposit)` rather than merged into a single grand total. 
*   *Why*: Merging them into a grand total makes the rental seem artificially expensive and masks the fact that the deposit is fully refundable, causing user drop-off.

#### Hierarchical Sections & Sorting Rules

**1. Active Rentals (In Hand)**
*   **Sorting**: Sorted by **closest return date** (items due back first appear at the top).
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Thumbnail]  DSLR Camera      [Active ]│
    │               Host: Ali Raza            │
    │               Due: Jul 18 (1 day left)  │
    │               Rs 2,700 total            │
    │                        [💬 Coordinate]  │
    └─────────────────────────────────────────┘
    ```
*   **Metrics**: Due date and countdown only. Countdown turns **amber/red** when `< 48 hours` remaining.
*   **Action**: `[💬 Coordinate]` to text the host for handback.

**2. Pending Requests (Waiting for Host)**
*   **Sorting**: Sorted by **closest start date** (rentals starting sooner float to the top so you can spot delayed approvals and look for backups).
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐

    │  [Thumbnail]  DSLR Camera    [Pending ⏳]│
    │               Host: Ali Raza            │
    │               Jul 15–18  ·  3 days      │
    │               Rs 2,400 total            │
    │  [Cancel Request]            [💬 Chat]  │
    └─────────────────────────────────────────┘
    ```
*   **Metrics**: Total price (daily rate × days+ delivery) displayed clearly to show financial commitment.
*   **Actions**:
    *   `[Cancel Request]`: Ghost button to abort and delete the pending request.
    *   `[💬 Chat]`: Navigates directly to the Inbox chat with the host.

**3. Upcoming Rentals (Accepted, Not Started)**
*   **Sorting**: Sorted by **closest start date** (what's starting next is top-of-mind).
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Thumbnail]  DSLR Camera   [Confirmed ]│
    │               Host: Ali Raza            │
    │               Starts Jul 15 (In 2 days) │
    │               Rs 2,700 (+ Rs 1.5k dep)  │
    │               🚚 Host delivering        │  ← Only shown if delivery is enabled
    │                          [💬 Coordinate]│
    └─────────────────────────────────────────┘
    ```
*   **Metrics**: Time countdown (`In X days`), pricing/deposit preview.
*   **Handover Tag**: Displays `🚚 Host delivering` **ONLY when delivery is enabled**. If pickup (default), no tag is displayed to keep cards clean.
*   **Action**: `[💬 Coordinate]` opens chat to agree on meetup time and exact handoff details.

**4. Pending Reviews (Returned, Needs Rating)**
*   **Sorting**: Sorted by **most recent completion** (fresh memories take priority).
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Thumbnail]  DSLR Camera   [Completed ]│
    │               Host: Ali Raza            │
    │               Rented Jul 15–18          │
    │                                         │
    │              [⭐ Write Review]          │
    └─────────────────────────────────────────┘
    ```
*   **Action**: `[⭐ Write Review]` opens the  rating modal.

#### Renter's Booking Detail Sheet (Opens by tapping any card)
Provides complete transaction details and pickup coordinates, preventing card clutter:

```
┌──────────────────────────────────────────────┐
│  BOOKING DETAIL                     [Close ✕]│
│                                              │
│  ┌───┐  DSLR Camera               📍 Gulberg │
│  │📷 │  Rs 800 / day                         │
│  └───┘  View Listing →                       │
│                                              │
│  Host        Ali Raza  ★ 4.9                 │
│              0321-4567890                    │
│                                              │
│                                              │
│  Timeline: Jul 15 – Jul 18 (3 days)          │
│  Status:   [Confirmed ✅]                    │
│  Handoff     🚚 You deliver                  │  ← Only shown if delivery is enabled
│                                              │

│                                              │
│                                              │
│  💰 Price Breakdown                          │
│  Rent (Rs 800 × 3 days)             Rs 2,400 │
│  Delivery Fee                       Rs   300 │
│  Security Deposit (Refundable)      Rs 1,500 │
│  ──────────────────────────────────────────  │
│  Total Upfront Due                  Rs 4,200 │
│                                              │
│  📄 Rental Rules                             │
│  - Do not use in rain                        │
│  - Return with fully charged battery         │
│                                              │
│  [ Cancel Request ]                          │  ← Only shown when status is Pending
└──────────────────────────────────────────────┘
```

*   **Item Context Header**: Thumbnail photo, Item Title, and Daily Rate, with a `View Listing →` link to review original specs.**Location**: Displays the listing's Area / Neighborhood (e.g. `Gulberg, Lahore`), pulled directly from the listing record
*   **Booking Info**: Exact ren 
tal dates, total days, and current deal status badge.
*   **Host Identity & Contact**: Label + name + star rating as a clean text row. Phone number on the line below. No avatar — avatars are a card-scanning pattern, not appropriate in a structured detail sheet.

*   **Financials**: Itemized pricing (Rent, Delivery Fee, Security Deposit) summed to **Total Upfront Due**.
*   **Host's Rental Rules**: Specific rules set by the host to avoid deposit disputes.
*   **Footer Action — Phase 
Dependent**:
    *   *Pending*: `[Cancel Request]` — only window where cancellation is allowed (before host accepts).
    *   *Confirmed / Active*: coordinate
    *   *Completed (review pending)*: `[⭐ Write Review]`

### Sub-Tab B: Renting Out (Lender Hat)
Shows active coordinates for items you own that are being requested or rented by others. Cards are **Person-First** (renter avatar anchored left) — the lender's primary concern is WHO is accountable for their which item.

#### Section Ordering (Priority by Consequence)
Sections are ordered by urgency, not alphabetically. Cards within each section are sorted by soonest relevant date.

**1. Pending Approvals** (sorted by closest request start date)
*   **Sorting**: Requests whose start date is soonest float to top — a request starting tomorrow needs an answer today or the renter can't plan.
*   **Card Anatomy**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Avatar]  Hassan Ali ★ 4.8    [pending]│
    │            DSLR Camera                  │
    │            Jul 15–18  ·  3 days         │
    │            Rs 2,400 potential           │
    │                                [View →] │
    └─────────────────────────────────────────┘
    ```
    *   **Avatar**: Always visible, left-aligned (person-first).
    *   **Rating**: Number only — average rating of renter (as a renter, not their listing rating).
    *   **Earnings on card**: Rental earnings (Rent only, no deposit) shown upfront — lender makes a business decision and needs the value visible without tapping.
    *   **[View →]**: Single action. Opens the Decision Bottom Sheet.
    *   *No inline Accept/Decline — lender must see renter's trust profile first.*

*   **Decision Bottom Sheet (opens on [View →])**:
    ```
    ┌──────────────────────────────────────┐
    │  DSLR Camera  ·  Jul 15–18  ·  3d   │  ← Context strip
    ├──────────────────────────────────────┤
    │  [Avatar]  Hassan Ali                │
    │  Member since Apr 2026               │
    │                                      │
    │  6 rentals completed  ·  ★ 4.8       │
    │  View 6 reviews →                    │
    │                                      │
    │  [ 💬 Message Renter ]               │  ← Secondary/ghost action
    │                                      │
    │  [   Decline   ]  [   Accept   ]     │  ← Primary actions
    └──────────────────────────────────────┘
    ```
    *   **Context strip** at top shows item + dates so the lender doesn't lose context when the sheet opens over the card.
    *   *Member since* date shows tenure (platform accountability signal).
    *   *Rentals completed* + *rating* as a renter (not their listing's rating).
    *   **"View X reviews →"**: Links to renter's public profile reviews — no inline text bloat.
    *   **[💬 Message Renter]**: Secondary ghost button. Opens Inbox conversation; request stays pending.
    *   **[Accept]** / **[Decline]**: Primary decision triggers — only here, never on the card.

**2. Upcoming Rentals (Accepted, Not Started)**
*   **Sorting**: Sorted by **closest start date** (rentals starting sooner float to the top so you can prep for meetups).
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Avatar]  Hassan Ali       [Confirmed ]│
    │            DSLR Camera                  │
    │            Starts Jul 15 (In 2 days)    │
    │            Rs 2,700 · 🚚 You deliver    │  ← Only shown if delivery is enabled
    │                         [💬 Coordinate] │
    └─────────────────────────────────────────┘
    ```
    *   **Handover Tag**: Displays `🚚 You deliver` **ONLY when delivery is enabled** for the booking. If pickup (default), no tag is displayed.
    *   **Action**: `[💬 Coordinate]` opens chat to coordinate exact handoff details.

**3. Currently Out** (sorted by closest return date)
*   **Sorting**: Item due back soonest appears first — what's most urgently expected takes priority.
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Avatar]  Hassan Ali        [Active   ]│
    │            DSLR Camera                  │
    │            Due: Jul 18 (1 day left)     │
    │            Rs 2,700 earned               │
    │                         [💬 Message]    │
    └─────────────────────────────────────────┘
    ```
    *   **Earnings shown**: `Rent + Delivery Fee` (e.g. Rs 2,400 + Rs 300 = Rs 2,700). Security deposit excluded — it's held collateral, not earnings.
    *   **Countdown**: Turns **amber** at `< 48h`, **red** at `< 24h`.
    *   **[💬 Message]**: Only action. Nothing else to decide here — deal is live.

**4. Pending Reviews** (sorted by most recent rental end date)
*   **Sorting**: Most recently completed rental first — fresher memory, more useful review.
*   **Card Design**:
    ```
    ┌─────────────────────────────────────────┐
    │  [Avatar]  Hassan Ali    [Completed 🏁] │
    │            DSLR Camera                  │
    │            Jul 15–18                    │
    │                      [⭐ Write Review]  │
    └─────────────────────────────────────────┘
    ```
    *   Avatar-first because the lender is reviewing a person's behaviour as a renter, not the item.
    *   Card disappears once review is submitted.

#### Lender's Booking Detail Sheet (Opens by tapping any card in Upcoming, Currently Out, or Completed)
Provides complete transaction details, renter contact, and earnings breakdown from the lender's perspective. Avoids image elements (no avatar) for clean data-density.

```
┌──────────────────────────────────────────────┐
│  BOOKING DETAIL                     [Close ✕]│
│                                              │
│  Renter      Hassan Ali  ★ 4.8               │
│              0321-4567890                    │
│                                              │
│  Item        DSLR Camera                     │
│              View Listing →                  │
│                                              │
│  Timeline    Jul 15 – Jul 18 (3 days)        │
│  Status      [Confirmed ✅]                  │
│  Handoff     🚚 You deliver                  │  ← Only shown if delivery is enabled
│                                              │
│  💰 Your Earnings                            │
│  Rent (Rs 800 × 3 days)             Rs 2,400 │
│  Delivery Fee                       Rs   300 │
│  ──────────────────────────────────────────  │
│  Total Earnings                     Rs 2,700 │
│  + Rs 1,500 deposit to collect at handoff    │
│                                              │
│  [ 💬 Coordinate ]                           │  ← Phase-dependent action
└──────────────────────────────────────────────┘
```

*   **Renter Contact Row**: Renter's name, rating, and direct phone number. (Always visible to the lender on confirmed/active bookings).
*   **Item Context**: Item name with a `View Listing →` link to review original listing specifics.
*   **Logistics & Status**: Transaction timeline, status badge, countdown, and `🚚 You deliver` indicator (shown ONLY when delivery is enabled; omitted for standard pickup).
*   **Earnings Breakdown**:
    *   Itemized rental rate times days + delivery fee.
    *   **Security Deposit Callout**: Explicit reminder warning the lender to collect the deposit amount (or confirm handback) at handoff/return.
*   **Footer Actions — Phase Dependent**:
    *   *Pending Approvals*: `[ Decline ]` and `[ Accept ]` primary decision triggers.
    *   *Confirmed / Active (Upcoming / Currently Out)*: `[ 💬 Coordinate ]` (navigates directly to chat to coordinate handoff).
    *   *Completed (review pending)*: `[ ⭐ Write Review ]` (opens modal to rate the renter).

---

## 3. Listings Tab (`/listings`)

The **Warehouse storefront**. Strictly for managing your inventory, availability, and pricing. Contains no transactional clutter or history.

```
┌──────────────────────────────────────┐
│  LISTINGS                            │
│  [ All ]   [ Active ]   [ Paused ]   │  ← Filter chips
│                                      │
│  [ + List New Item ]                 │  ← Prominent button
└──────────────────────────────────────┘
```

### The Item Card Architecture
Balanced, 2-column symmetrical layout splitting primary editing and secondary management into equal 50/50 bottom action buttons.

```
┌────────────────────────────────────────────────────────┐
│ ┌────────┐  DSLR Camera                     [ Live ● ] │
│ │ Item   │  📷 Electronics · Gulberg                   │
│ │ Photo  │  Rs 800 / day ✏️                            │
│ └────────┘  👁 128 views   [ 🔴 2 pending requests ]  │
├───────────────────────────┬────────────────────────────┤
│  [ ✏️ Edit Listing ]      │  [ ⚙️ Actions ▾ ]          │  ← 50/50 Split Action Bar
└───────────────────────────┴────────────────────────────┘
```

#### 1. Information Visible Directly on Card
*   **Media & Metadata**:
    *   **Square Thumbnail Photo**: 80×80px rounded image with category icon fallback (`Package` icon).
    *   **Listing Title**: Bold title (single-line truncated).
    *   **Category & Neighborhood**: Category icon + name + area (`📷 Electronics · Gulberg`).
*   **Dynamic Status Badge**: Positioned neatly in the top-right corner without menu crowding:
    *   `Live ●` (Emerald Green): Active and visible in marketplace search.
    *   `Paused ●` (Muted Gray): Hidden from search results (no new requests allowed).
    *   `Out on rental ●` (Amber): Currently rented out to a user. Dynamically replaces "Live" status.
*   **Metrics & Quick Triggers**:
    *   **Interactive Price Display (`Rs 800 / day ✏️`)**: Tapping the pencil icon opens a 1-tap quick-edit popover to adjust the daily rate without launching the full edit wizard.
    *   **View Metrics (`👁 128 views`)**: Place this as a compact muted metric directly underneath the price row, before the pending requests badge. It should be visible but secondary to price and status, helping the lender understand demand without crowding the card.
    *   **Pending Requests Badge (`[ 🔴 2 pending requests ]`)**: Accent-colored badge that appears when requests are awaiting approval. Tapping it navigates straight to **Bookings → Renting Out**.

#### 2. Action Hierarchy (50/50 Split Action Bar)

*   **Left Button (50%) — Primary `[✏️ Edit Listing]`**:
    *   Launches the full 7-step edit wizard (`/listings/[id]/edit`).
*   **Right Button (50%) — Secondary `[⚙️ Actions ▾]` Dropdown Menu**:
    *   Tapping opens a clean contextual dropdown menu containing:
        1.  `⏸️ Pause Listing` / `▶️ Resume Listing`: Instantly toggles search visibility. *(Disabled with tooltip when status is "Out on rental")*.
        2.  `📅 Manage Availability`: Opens the **Inline Availability Modal** directly on the page without navigating away.
        3.  *─── (divider) ───*
        4.  `🗑️ Delete Listing` *(Danger Red)*: Triggers the Delete Confirmation Modal.

#### 3. Inline Quick-Edit Modals (Zero-Redirect Workflows)
*   **Interactive Price Popover (`Rs 800 / day ✏️`)**:
    *   Tapping the pencil icon opens a 1-tap mini popover/sheet to update the daily rate instantly without entering the 7-step edit wizard.
*   **Inline Availability Modal (`📅 Manage Availability`)**:
    *   Tapping opens an inline bottom sheet / modal containing an interactive date-blocking calendar (`<AvailabilityCalendar />`).
    *   Lenders can tap dates to block/unblock them and save instantly, returning to the inventory list with zero page reloads or URL shifts.
    *   *Shared Architecture*: Reuses the exact same `<AvailabilityCalendar />` component embedded in Step 6 of the full edit wizard.

#### 4. Safety Guards & Delete Confirmation Modal
*   **Confirmation Modal**: Selecting `Delete Listing` from the `[⚙️ Actions ▾]` menu opens a mandatory confirmation sheet:
    > *"Delete listing? '[Title]' will be archived and removed from the marketplace. This cannot be undone."*
*   **Active Rental Protection**: If an item has active (`ongoing`) or confirmed upcoming (`confirmed`) rentals, deletion is **strictly blocked** with an alert: *"Cannot delete item with active or upcoming bookings."*

### Listing Form Wizard (`/listings/new` or `/listings/[id]/edit`)
Multi-step flow to create or edit inventory listings.

*   **Step 1: Photos (Required)**
    *   Upload up to **5 photos** (PNG/JPG, up to 7MB each).
    *   First photo acts as the primary "Cover Photo".
    *   Supports drag-and-drop file upload and drag-and-drop image reordering.
*   **Step 2: Category & Title (Required)**
    *   **Listing Title**: Brand, model, and accessories (3–200 characters).
    *   **Category**: Selection from 8 pre-defined categories (*Power & Energy*, *Tools & Home Fix*, *Cameras & Creators*, *Music & Audio*, *Clothing & Fashion*, *Party Essentials*, *Bikes & Boards*, *Travel & Outdoors*).
*   **Step 3: Description & Specs (Description and Condition are Required; Specs are Optional)**
    *   **Description**: Detailed text about the item and inclusions (10–2000 characters).
    *   **Condition**: Selection of *✨ Like New*, *👍 Good*, *👌 Fair*, or *🔧 Well Used*.
    *   **Specifications** (Optional): Key-value pair configuration for detailed model specs.
*   **Step 4: Pricing & Terms (Daily Rate and Duration are Required; Security Deposit, Delivery, and Rules are Optional)**
    *   **Daily Rate**: Rent amount in PKR/day.
    *   **Security Deposit** (Optional): Refundable deposit amount in PKR.
    *   **Duration**: Minimum rental days (default: 1) and maximum rental days (default: 30) restrictions.
    *   **Delivery**: Toggle to offer delivery/pickup with optional round-trip delivery fee.
    *   **Rental Rules** (Optional): Expectations/rules for the item (max 1000 characters).
*   **Step 5: Area (Required)**
    *   **Location**: General Lahore neighborhood search & select (DHA, Gulberg, Johar Town, etc.). NO EXACT ADDRESSES
*   **Step 6: Availability (Optional)**
    *   **Blocked Dates Calendar**: Allows blocking out specific dates/ranges when the item is unavailable for bookings.
*   **Step 7: Review**
    *   Consolidated summary screen showcasing all metadata for confirmation before submitting/publishing.

---

## 4. Messages / Chat Tab (`/messages`)

The **Communication and Coordination Hub**. Consolidates all inquiry and rental-related conversations between renters and lenders, embedding live booking context cards and phase-specific action controls directly alongside chat threads.

### Layout Overview
*   **Desktop Split View (`xl` breakpoint)**: 3-column layout (Conversation List | Active Chat Feed | Sticky Context Panel).
*   **Mobile / Tablet View**: 2-pane view (Conversation List ↔ Active Chat View) with a slide-up Context Drawer triggered via the chat header (`ChevronDown`).

---

### 4.1 Conversation List Page (`/messages`)

Main inbox view displaying active and past chat threads across all rental deals.

```
┌────────────────────────────────────────────────────────┐
│ ┌────────┐  📦 Renting from Ali Raza      Yesterday    │
│ │ Item   │  DSLR Camera  •  [Confirmed ✅]             │
│ │ Img 🧑 │  "Sounds good, see you!"               🔴   │
│ └────────┘                                             │
└────────────────────────────────────────────────────────┘
```

#### Filtering & Search Mechanics
1.  **Expandable Search**: Top search bar toggle that filters conversations in real time by counterpart name or listing title.
2.  **Tier 1 Filters (Role & Status)**:
    *   `All`: Displays every conversation thread.
    *   `As Renter`: Filters for deals where the user is borrowing an item.
    *   `As Lender`: Filters for deals where the user owns and is renting out the item.
    *   `Unread`: Filters strictly for threads with unread messages (`unreadCount > 0`).
3.  **Tier 2 Filters (Deal Phase)**:
    *   `All`, `Inquiry`, `Pending`, `Confirmed`, `Ongoing`, `Completed`.

#### Conversation Preview Card (`ConversationPreview.tsx`)

*   **Dual Media Composite (Item Image + Avatar Overlay)**:
    *   **Primary Square Thumbnail**: Item listing photo (`60×60px` ).
    *   **Avatar Badge Overlay**: Counterpart's circular avatar (`26×26px` ) positioned at the bottom-right corner  of the item thumbnail.
*   **Row 1: Role & Identity + Time**:
    *   **Left**: Role prefix (`📦 Renting from` or `🏠 Lending to` ) + Counterpart Name ( bold).
    *   **Right**: Timestamp of last message (`lastMessage.createdAt`). Highlighted in accent color and semibold when unread.
*   **Row 2: Item & Phase Badge**:
    *   Item Title ( truncated) + dot separator (`•`) + **Phase Badge** (`PhaseBadge.tsx`):
        *   `inquiry`: Muted outline pill.
        *   `pending`: Amber background pill .
        *   `confirmed`: Emerald background pill .
        *   `ongoing`: Emerald pill with active **pulsing animation** 
        *   `completed`: Muted border pill.
*   **Row 3: Last Message & Unread Counter**:
    *   **Left**: Snippet of last message body (`lastMessage?.body` or `"No messages yet"`). 
    *   **Right**:unread badge just circle no numeric data

#### Expandable Header Search
*   Header features a `Messages` title and a search toggle button (`Search` icon).
*   Tapping search expands a full-width input field (`"Search by name or item..."`) with auto-focus and a close button (`X`) to filter the conversation list live.

---

### 4.2 Conversation & Chat View (`/messages/[id]`)

The active chat interface for real-time messaging and deal coordination.

```
┌──────────────────────────────────────────────┐
│ [←] [Avatar] Ali Raza [Confirmed ✅]   [ ˅ ]  │  ← Sticky Header
│     DSLR Camera · Rs. 800/day                │
├──────────────────────────────────────────────┤
│               📋 Booking Requested           │  ← System Message
│             May 25–28 · Total: Rs. 7,500    │
│                                              │
│ [Avatar] Sure, it is available!              │  ← Counterpart Bubble
│ 2:15 PM                                      │
│                                              │
│                 Hi, I'm interested in renting│  ← User Bubble
│                 2:00 PM                      │
├──────────────────────────────────────────────┤
│ [ Write a message...                 ] [Send]│  ← Sticky Input Bar
└──────────────────────────────────────────────┘
```

#### 1. Sticky Chat Header
*   **Navigation (`[←]`)**: Mobile back button returning to the conversation list.
*   **Identity & Context**: Avatar, counterpart display name, and deal phase badge.
*   **Listing Reference**: Direct link to `/listings/[id]` displaying item title and daily rate.
*   **Context Trigger (`[ ˅ ]`)**: Mobile/tablet dropdown toggle opening the Context Drawer.

#### 2. Chat Message Feed
*   **System Event Cards**: Centered chrome cards representing deal state updates:
    *   `📋 Booking request submitted` (Dates + Total Price)
    *   `✅ Booking confirmed`
    *   `❌ Booking declined`
    *   `🔑 Rental period started`
    *   `🏁 Rental completed`
*   **User Message Bubbles**:
    *   *Self Bubbles*: Right-aligned styled bubbles.
    *   *Counterpart Bubbles*: Left-aligned surface bubbles with sender avatar.

#### 3. Sticky Chat Input Bar
Bottom-anchored input row featuring auto-focus text input and primary `[Send]` trigger.

---

### 4.3 Floating Booking Context Panel / Drawer

Stays permanently docked on desktop (`xl` right sidebar) and slides up as a bottom sheet drawer on mobile/tablet. Gives immediate deal visibility without navigating away from the chat thread.

```
┌──────────────────────────────────────────────┐
│  LISTING CONTEXT                             │
│  ┌───┐  DSLR Camera                          │
│  │📷 │  Rs 800 / day                         │
│  └───┘  View Listing →                       │
├──────────────────────────────────────────────┤
│  BOOKING DETAILS               [Confirmed ✅]│
│  Dates       Jul 15 → Jul 18                 │
│  Duration    3 days                          │
│  Total Price Rs. 2,400                       │
├──────────────────────────────────────────────┤
│  ACTIONS                                     │
│  [ View Booking Details ]                    │
├──────────────────────────────────────────────┤
│  LENDER / RENTER                             │
│  [Avatar]  Ali Raza                          │
│            ★ 4.9 · 12 rentals       [View]   │
└──────────────────────────────────────────────┘
```

#### Sections of the Context Panel:
1.  **Listing Context Card**: Item thumbnail, title, daily rate, and `View Listing →` link.
2.  **Booking Details Summary**:
    *   Phase badge header (`inquiry`, `pending`, `confirmed`, `ongoing`, `completed`).
    *   *Inquiry state*: Shows *"Inquiry only — no dates selected yet."*
    *   *Active/Booked states*: Rental date range, total days count, and calculated Total Price badge.
3.  **Phase-Locked Context Actions**:
    *   `inquiry` + `renter`: `[Select Dates to Book]` (links directly to listing calendar).
    *   `pending` + `lender`: `[Approve Request]` (primary accent) & `[Decline]` (danger outline).
    *   `pending` + `renter`: `[Cancel Request]` (danger outline).
    *   `confirmed` / `ongoing`: `[View Booking Details]` (secondary button opening booking detail sheet).
    *   `completed`: `[Leave a Review]` (primary accent) & `[Rent Again]` (secondary button).
4.  **Counterpart Trust Profile**:
    *   Role label (`Lender` or `Renter`).
    *   Avatar, display name, aggregate rating, and total completed rentals (`★ 4.9 · 12 rentals(as lender or renter same as current role)`).
    *   `View` button linking directly to counterpart's public profile.

---

## 5. Profile (`/profile`, `/users/[id]`)

The **Identity, Reputation, and Earnings Hub**. A student has one unified profile identity but two distinct marketplace reputations: one earned as a **Lender** (item quality, responsiveness, punctuality) and one earned as a **Renter** (care for gear, timely return). They are never merged into a single ambiguous rating.

---

### A. Own vs Public View Architecture

To keep the Profile experience clean, fast, and student-focused:

* **Unified Structure**: Shared hero header layout across both views so student identity feels consistent.
* **Own Profile (`/profile` or `/me`)**: Unlocks private financial metrics, full rental history, received/given reviews, and settings.
* **Public Profile (`/users/[id]`)**: Surfaces public trust signals (verified phone, tenure, role ratings, active storefront inventory, and published reviews). Strictly hides private financial totals, addresses, phone numbers, and booking ledgers.

| Section / Data | Private Own View (`/profile`) | Public Counterpart View (`/users/[id]`) |
| :--- | :---: | :---: |
| Avatar, Display Name, Area badge, Tenure | ✅ | ✅ |
| Phone Verified Badge (`📱 Phone Verified`) | ✅ | ✅ |
| Dual Reputation Chips (`Lending` / `Renting` ratings and number  of rentals as lender or renter same as current role (in hich wwe are seeing him)) | ✅ | ✅ |
| Primary CTA | `[ ✏️ Edit Profile ]` |notthing |
| Tab 1 | **`[ 💰 Earnings ]`** (Lender KPIs & monthly summary) | **`[ 📦 Listings ]`** (Active storefront items) |
| Tab 2 | **`[ 📦 History ]`** (Full borrowed & lent records) | **`[ ⭐ Reviews ]`** (Public feedback feed) about this person given byy otheers|
| Tab 3 | **`[ ⭐ Reviews ]`** | *(Hidden)* |
| Tab 4 | **`[ ⚙️ Settings ]`** (Edit profile, theme, auth) | *(Hidden)* |
| Monetary amounts & earnings metrics | ✅ Visible | ❌ Hidden |

---

### B. Hero & Dual-Role Reputation Header

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Avatar]  Hassan Ali                                    [ Edit Profile ]│
│           📍 Gulberg, Lahore  ·  Member since Jun 2026                 │
│           📱 Phone Verified                                             │
│                                                                         │
│  [ 🏠 Lending: ★ 4.9 (8 rentals) ]   [ 📦 Renting: ★ 4.8 (6 rentals) ]  │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Identity & Trust Pills**:
   - Avatar photo with initials fallback badge.
   - Display Name + Area (`📍 Gulberg, Lahore`).
   - Tenure (`Member since Jun 2026`).
   - Verification status badge (`📱 Phone Verified`).
2. **Dual-Role Reputation Chips**:
   - **`[ 🏠 Lending: ★ 4.9 (8 rentals) ]`**: Calculated exclusively from reviews written by renters after completed bookings. Answers: *Can I trust this owner and their gear?*
   - **`[ 📦 Renting: ★ 4.8 (6 rentals) ]`**: Calculated exclusively from reviews written by lenders after completed bookings. Answers: *Can I trust this student with my gear?*
   - Tapping either chip filters the content on the active tab (e.g. switching the review feed or history perspective).
   - If a student has zero completed rentals in a role, the chip displays `New to lending` or `New to renting` (never `0.0 ★`).

---

### C. Tab Contents Breakdown

#### 1. Earnings Tab (`[ 💰 Earnings ]`) *(Own Profile Only)*

Provides a clear financial overview for lenders calculated dynamically from existing `bookings` data (`owner_id = user.id`) without chart heavy dependencies.

##### A. Top KPI Cards (3 Cards)
```
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Total Earned 💰          │ Pending / Active ⏳      │ Completed Lent 📦        │
│ Rs. 24,500               │ Rs. 5,400                │ 8 rentals                │
│ (All-time completed)     │ (Ongoing & confirmed)    │ (Lender transactions)    │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```
- **Total Earned**: `SUM(total_amount + delivery_fee)` for all `completed` bookings where `owner_id = user.id`. Security deposits are strictly excluded as they are refundable collateral.
- **Pending / Active**: `SUM(total_amount + delivery_fee)` for `confirmed` or `ongoing` bookings awaiting completion.
- **Completed Lent**: `COUNT(*)` of completed rentals as lender.

##### B. Monthly Earnings Breakdown
A simple, pure-CSS list grouped by month:
- `July 2026`: **Rs. 14,500** · 4 rentals
- `June 2026`: **Rs. 10,000** · 4 rentals

---

#### 2. Public Storefront Tab (`[ 📦 Listings ]`) *(Public Profile Only)*

Surfaces the student's active and available items for rent using standard `ListingCard` components:
- Only listings with `status = 'active'` are shown. Draft, paused, or archived listings are hidden.
- Visitors can tap any card to view specs or initiate a booking.
- If the user has no active listings, displays a clean empty state: *"Hassan Ali has no active listings right now."*

---

#### 3. History Tab (`[ 📦 History ]`) *(Own Profile Only)*

The unified ledger of past transactions with sub-toggles to keep borrowing and lending distinct:
- **Sub-Toggle**: `[ Borrowed (Renter) ]` | `[ Lent Out (Lender) ]`
- **Card UI**: Reuses the compact `BookingCard` component displaying item thumbnail, title, counterpart name, completed dates (`Jul 15–18, 2026`), and total amount spent/earned.

---

#### 4. Reviews Tab (`[ ⭐ Reviews ]`) *(Own & Public Profile)*

- **Aggregate Rating Bar**: Displays average rating and total review count for the active role (e.g. `★ 4.9 / 5 · 8 reviews`).
- **Role Filters**: `All` | `As Lender` | `As Renter`.
- **Review Card**:
  - Reviewer avatar + display name.
  - Role tag (`Lender` or `Renter`).
  - Star rating (1–5 stars) + creation date.
  - Comment text (up to 500 characters).
  - Item reference link (`Re: DSLR Camera Kit`).

---

#### 5. Settings Tab (`[ ⚙️ Settings ]`) *(Own Profile Only)*

- **Profile Info**: Editable Display Name & Area selector (`PUT /me`).
- **Trust & Phone**: Phone verification status & trigger.
- **Preferences**: Light / Dark mode toggle.
- **Account**: Sign Out CTA.

---

### D. Review & Trust Rules

1. **Completed Bookings Only**: A review can only be created for a booking with `status = 'completed'`.
2. **Role & Target Auto-Derivation**: The backend automatically derives `reviewer_id`, `target_id`, `listing_id`, and `role` (`as_lender` or `as_renter`) from the booking record.
3. **Explicit Listing FK**: The `reviews` table stores `listing_id` directly to allow fast indexing and retrieval on Listing Detail Pages without nested joins.
4. **Independent Role Ratings**: Lender ratings (evaluating owner/gear) and Renter ratings (evaluating borrower behavior) are stored and aggregated separately. Never combine them into a single score.

---

## 6. Summary of Core Product Decisions

| Decision | Rationale |
| :--- | :--- |
| **Bookings has Sub-tabs (Renting / Renting Out)** | Consolidates all deal tracking into one transaction center with clean, active terminology. |
| **No Transaction History in Listings/Bookings** | History is non-actionable; moved to Profile to serve as trust signals. |
| **No Inline Accept/Decline on Request Cards** | Prevents blind approvals. Lenders must see the renter's trust score in the bottom sheet. |
| **Avatar always visible on Cards** | The human face is the primary P2P identifier. |
| **No Message Text on Cards** | Kept cards scannable. A simple indicator dot redirects to the Inbox for details. |
| **Interactive Price on Inventory Cards** | Allows quick, frictionless daily rate updates without launching the edit wizard. |
| **Dynamic "Out on rental" status** | Prevents lenders from accidentally attempting to pause or edit availability when an item is with a renter. |
| **Public Profile displays verified history list** | Builds student-to-student marketplace trust. |
| **Bottom Sheet has secondary Chat button** | Avoids navigation friction when lenders need to clarify details before accepting. |
| **Renter Cards are Item-First** | Renters care primarily about the gear they booked, so the item thumbnail is the visual anchor (unlike lender cards which are renter-avatar focused). |
| **Total Price on Renter Booking Cards** | Renters need to see total spend (daily rate × days) directly rather than doing mental math. |
| **Detailed Meetup Info hidden until Confirmed** | Protects user privacy by withholding exact pickup addresses/phone numbers for pending requests. |
| **Priority Alert Strip** | Floats critical actions (pickups/returns in < 24h) to the top of the bookings view to prevent deal friction. |
| **Strict Sub-Tab Sorting Rules** | Cards are ordered dynamically based on urgency: active rentals sorted by closest return, requests by closest start, and reviews by most recent completion. |
| **Embedded Booking Context in Chat** | Context panel alongside chat prevents back-and-forth context switching and provides instant phase action triggers. |
| **Two-Tiered Inbox Filtering (Role + Phase)** | Allows users to quickly toggle between borrowing/lending and filter by specific deal status (inquiry, pending, confirmed, ongoing, completed). |
| **System Event Cards in Chat** | Keeps deal milestones clear, transparent, and immutable directly in the conversation history stream. |
