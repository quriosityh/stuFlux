# Chapter 6 — Testing

---

## 6.1 Testing Approach

StuFlux used a layered testing strategy covering unit, integration, and user acceptance levels. The goal was to validate correctness of business logic, API reliability, and end-to-end user flows.

| Level | Tool | Scope |
| :--- | :--- | :--- |
| Unit Testing | Jest | Individual functions and utilities |
| API Integration Testing | Supertest + Jest | Express.js route handlers |
| Component Testing | React Testing Library | UI component behavior |
| Manual / UAT | Browser (Chrome, Firefox) | End-to-end user workflows |

---

## 6.2 Unit Testing

Unit tests focused on isolated business logic functions.

**Areas covered:**
- Date conflict detection logic (booking availability checks)
- Pricing calculation (`daily_rate × duration`)
- Input validation schemas (Zod validators for forms and API payloads)
- Utility helpers (date formatting, string sanitization)

**Example — Booking Pricing Calculation:**

```typescript
test("calculates total amount correctly", () => {
  const result = calculateTotal({
    dailyRate: 500,
    startDate: "2024-06-01",
    endDate: "2024-06-05",
  });
  expect(result).toBe(2000); // 4 days × 500
});
```

---

## 6.3 API Integration Testing

Express.js API routes were tested using **Supertest** with a test database seeded with sample data.

**Routes tested:**

| Method | Endpoint | Test Case |
| :--- | :--- | :--- |
| POST | `/api/bookings` | Creates booking; rejects conflicting dates |
| GET | `/api/listings` | Returns paginated listings |
| PATCH | `/api/bookings/:id` | Owner confirms / rejects booking |
| POST | `/api/messages` | Sends a message; validates sender authorization |
| POST | `/api/reviews` | Submits review; blocks duplicate submission |

**Sample test — Booking conflict rejection:**

```typescript
it("rejects booking when dates conflict", async () => {
  const res = await request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${renterToken}`)
    .send({
      listingId: "listing-uuid",
      startDate: "2024-06-01",
      endDate: "2024-06-05",
    });

  expect(res.status).toBe(409);
  expect(res.body.error).toBe("Dates are not available");
});
```

---

## 6.4 Component Testing

React components were tested using **React Testing Library** to verify render behavior and user interactions.

**Components tested:**

| Component | Test Focus |
| :--- | :--- |
| `BookingForm` | Date selection, pricing display, submit button state |
| `ListingCard` | Renders title, price, category badge correctly |
| `MessageThread` | Displays messages in correct order |
| `ReviewForm` | Star rating input, text field, submit validation |
| `SearchBar` | Debounced input triggers search callback |

---

## 6.5 Test Cases

### TC-01: User Registration

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-01 |
| **Description** | New user registers with email and password |
| **Precondition** | User is not registered |
| **Steps** | Navigate to sign-up → enter name, email, password → submit |
| **Expected** | Account created; user redirected to homepage |
| **Result** | ✅ Pass |

---

### TC-02: Duplicate Booking Prevention

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-02 |
| **Description** | Renter tries to book already-confirmed dates |
| **Precondition** | Listing has a confirmed booking for June 1–5 |
| **Steps** | Renter selects June 3–7 → submits booking request |
| **Expected** | System returns error: "Dates are not available" |
| **Result** | ✅ Pass |

---

### TC-03: Owner Confirms Booking

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-03 |
| **Description** | Owner confirms a pending booking |
| **Precondition** | Pending booking exists |
| **Steps** | Owner opens booking request → clicks Confirm |
| **Expected** | Booking status → confirmed; dates blocked on calendar |
| **Result** | ✅ Pass |

---

### TC-04: Real-Time Message Delivery

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-04 |
| **Description** | Message sent by renter appears instantly for owner |
| **Precondition** | Both users have the conversation open |
| **Steps** | Renter types message → sends |
| **Expected** | Message appears in owner's chat without page refresh |
| **Result** | ✅ Pass |

---

### TC-05: Review Blind Reveal

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-05 |
| **Description** | Reviews are hidden until both parties submit |
| **Precondition** | Booking is completed |
| **Steps** | Renter submits review → checks owner profile |
| **Expected** | Review not visible until owner also submits (or 14 days pass) |
| **Result** | ✅ Pass |

---

### TC-06: Image Upload to Cloudinary

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-06 |
| **Description** | Listing photo uploads successfully |
| **Precondition** | Owner is on listing creation form, Step 3 |
| **Steps** | Owner selects image file → system uploads to Cloudinary |
| **Expected** | Image appears in preview; `cloudinary_public_id` saved to DB |
| **Result** | ✅ Pass |

---

### TC-07: Unauthorized Booking Attempt

| Field | Value |
| :--- | :--- |
| **Test ID** | TC-07 |
| **Description** | Guest (unauthenticated) tries to book an item |
| **Precondition** | User is not logged in |
| **Steps** | Guest clicks "Book Now" on listing detail page |
| **Expected** | Redirected to sign-in page |
| **Result** | ✅ Pass |

---

## 6.6 Bug Reports

| Bug ID | Description | Severity | Status |
| :--- | :--- | :--- | :--- |
| BUG-01 | Calendar did not block dates after booking rejection (race condition) | Medium | Fixed |
| BUG-02 | SSE connection dropped after 60s idle on Vercel serverless | High | Fixed (switched to polling fallback for serverless edge) |
| BUG-03 | Cloudinary upload failed silently on large files (>10MB) | Medium | Fixed (added client-side file size validation) |
| BUG-04 | Review form allowed submission after page refresh before partner submitted | Low | Fixed (added server-side idempotency check) |

---

## 6.7 Chapter Summary

Testing validated all core platform workflows. Unit tests confirmed business logic correctness; integration tests verified API contract compliance; component tests ensured UI reliability. Four bugs were identified and resolved during the testing phase. The platform passed all seven primary test cases, demonstrating stable functionality across authentication, bookings, messaging, and reviews.
