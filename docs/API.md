# API Reference

Base URL: `http://localhost:4000/api/v1`

## Authentication

Most endpoints accept an optional `Authorization: Bearer <clerk_jwt_token>` header. Endpoints marked with 🔒 **require** authentication.

The token is a short-lived JWT obtained via Clerk's `getToken()` on the frontend.

---

## Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Returns general system health and process status |
| GET | `/health/db` | — | Tests and returns database connection status |

### GET `/health`
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-13T12:00:00.000Z",
  "uptime": 120.45,
  "version": "1.0.0",
  "environment": "development",
  "memory": {
    "used": 45.2,
    "total": 60.1
  }
}
```

### GET `/health/db`
**Response:**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "type": "PostgreSQL",
    "provider": "Neon",
    "timestamp": "2026-07-13T12:00:00.000Z",
    "error": null
  }
}
```

---

## Users

These endpoints are mounted at root level (e.g., `/api/v1/me`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | 🔒 Required | Get the current user's profile |
| PUT | `/me` | 🔒 Required | Update the current user's profile |

### GET `/me`
**Response:**
```json
{
  "data": {
    "id": "c0a80101-1234-5678-abcd-1234567890ab",
    "clerk_user_id": "user_2Nabcdef...",
    "email": "user@example.com",
    "display_name": "John Doe",
    "area": "Gulberg",
    "created_at": "2026-06-30T10:00:00.000Z",
    "updated_at": "2026-07-13T11:30:00.000Z"
  }
}
```

### PUT `/me`
**Request Body:**
```json
{
  "display_name": "Jane Doe",
  "area": "DHA Phase 5"
}
```
*Note: Both fields are optional (minimum 2, maximum 100 characters).*

**Response:** Same profile structure as `GET /me` wrapped in a `data` object.

---

## Listings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/listings` | Optional | Browse and search listings with pagination and filters |
| GET | `/listings/:id` | Optional | Get detailed information for a single listing |
| GET | `/listings/owner/my` | 🔒 Required | Get listings owned by the authenticated user |
| POST | `/listings` | 🔒 Required | Create a new listing |
| PUT | `/listings/:id` | 🔒 Required | Update an existing listing (owner only) |
| GET | `/listings/:id/blocked-dates` | Optional | Get listing's manually blocked dates |
| PUT | `/listings/:id/blocked-dates` | 🔒 Required | Update listing's manually blocked dates (owner only) |

### GET `/listings`
**Query Parameters:**
- `q` — String (max 200). Case-insensitive partial match against listing `title`, `description`, and `category name`.
- `category_id` — Number. Filter by category database ID.
- `area` — String (2-100 chars). Filter by area.
- `delivery_available` — Boolean (accepts `true`/`1` or `false`/`0`).
- `min_rate` — Number (smallest currency unit, e.g. Paisa).
- `max_rate` — Number (smallest currency unit, e.g. Paisa).
- `start_date` — String (`YYYY-MM-DD`). Start of the requested rental window. **Must be paired with `end_date`.**
- `end_date` — String (`YYYY-MM-DD`). End of the requested rental window. **Must be paired with `start_date`.** Must be after `start_date`.
- `sort` — Sort order: `"popular" | "newest" | "rate_asc" | "rate_desc"` (default: `"popular"`). `popular` uses the weighted time-decay formula: `(booking_count × 3 + view_count) / (days_since_created + 2)`.
- `page` — Number (default: `1`).
- `limit` — Number (default: `20`, max: `50`).

> **Date filtering:** When `start_date` and `end_date` are both provided, the response excludes any listing that has (a) a `confirmed` booking overlapping the range, or (b) a manually blocked date range overlapping the range. Overlap is determined by the standard interval test: `existing_start <= end_date AND existing_end >= start_date`. Listings with only `pending` bookings in the range remain visible — pending bookings do not block availability.

**Response:**
```json
{
  "data": [
    {
      "id": "e0a80202-5678-1234-abcd-9876543210fe",
      "owner_id": "c0a80101-1234-5678-abcd-1234567890ab",
      "title": "Professional DSLR Camera",
      "description": "High-end DSLR camera including 24-70mm lens.",
      "category_id": 1,
      "daily_rate": 250000,
      "area": "Gulberg",
      "condition": "like_new",
      "rental_rules": "Please return in clean condition.",
      "status": "active",
      "specs": {
        "megapixels": 24,
        "includes_lens": true
      },
      "min_rental_days": 1,
      "max_rental_days": 14,
      "delivery_available": true,
      "delivery_fee": 50000,
      "security_deposit": 1000000,
      "booking_count": 3,
      "view_count": 42,
      "created_at": "2026-07-01T12:00:00.000Z",
      "updated_at": "2026-07-10T08:00:00.000Z",
      "photos": [
        {
          "url": "https://res.cloudinary.com/.../img1.jpg",
          "thumbnail_url": "https://res.cloudinary.com/.../img1_thumb.jpg",
          "width": 1200,
          "height": 800,
          "is_primary": true
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/listings/:id`
Increments the view count for the listing.

**Response:** `{ "data": ListingObject }`

### GET `/listings/owner/my`
Query parameters and response structure are identical to `GET /listings`, but limited to the authenticated owner's listings.

### POST `/listings`
Allows creation of listings (maximum of 10 active/draft listings per user).

**Request Body:**
```json
{
  "title": "Canon 5D Mark IV",
  "description": "Excellent condition DSLR for rent, includes battery and charger.",
  "category_id": 1,
  "daily_rate": 300000,
  "area": "Gulberg",
  "condition": "like_new",
  "rental_rules": "Handle with care, don't shoot in heavy rain.",
  "specs": {
    "brand": "Canon",
    "sensor": "Full Frame"
  },
  "min_rental_days": 1,
  "max_rental_days": 15,
  "delivery_available": false,
  "delivery_fee": 0,
  "security_deposit": 5000000,
  "status": "draft",
  "photos": [
    {
      "url": "https://res.cloudinary.com/.../canon.jpg",
      "thumbnail_url": "https://res.cloudinary.com/.../canon_thumb.jpg",
      "width": 1920,
      "height": 1080,
      "size_kb": 250,
      "mime_type": "image/jpeg",
      "position": 0,
      "is_primary": true
    }
  ]
}
```
*Note: Valid `condition` values: `"like_new" | "good" | "fair" | "well_used"`. Valid `status` values: `"draft" | "active" | "inactive" | "archived"`. Setting status to `active` requires at least one primary photo and verification.*

**Response:** `{ "data": ListingObject }` (Status 201)

### PUT `/listings/:id`
Updates a listing (owner only). Archived listings cannot be updated.

**Request Body:** A partial object matching the `POST /listings` schema.

**Response:** `{ "data": ListingObject }`

### GET `/listings/:id/blocked-dates`
**Response:**
```json
{
  "data": [
    {
      "start_date": "2026-07-20",
      "end_date": "2026-07-25"
    }
  ]
}
```

### PUT `/listings/:id/blocked-dates`
Overrides the manual blocked dates list for a listing.

**Request Body:**
```json
{
  "blocked_dates": [
    {
      "start_date": "2026-07-20",
      "end_date": "2026-07-25"
    }
  ]
}
```

**Response:** `{ "data": [ { "start_date": "2026-07-20", "end_date": "2026-07-25" } ] }`

---

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | Optional | Retrieve a list of all categories |

### GET `/categories`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Cameras",
      "slug": "cameras",
      "description": "Cameras, lenses, and accessories",
      "icon": "📷",
      "created_at": "2026-06-30T10:00:00.000Z"
    }
  ]
}
```

---

## Uploads

The file uploading process uses a **two-step client-to-cloud pattern**:
1. Request a signed token from the API server.
2. Upload the file directly from the client to Cloudinary.
3. Call `/uploads/complete` to validate and return the standardized database-ready photo structures.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/uploads/signature` | 🔒 Required | Retrieve signature and folder configuration for Cloudinary |
| POST | `/uploads/complete` | 🔒 Required | Register uploaded assets and get sanitized photo structures |

### POST `/uploads/signature`
**Request Body (optional):**
```json
{
  "listingId": "e0a80202-5678-1234-abcd-9876543210fe"
}
```

**Response:**
```json
{
  "upload": {
    "signature": "ab83c18...",
    "timestamp": 1715684400,
    "cloudName": "stuflux-cloud",
    "apiKey": "123456789012345",
    "folder": "stuflux/users/c0a8.../listings/e0a8...",
    "resource_type": "image",
    "max_files": 5,
    "max_file_size": 7340032,
    "listing_id": "e0a80202-5678-1234-abcd-9876543210fe"
  }
}
```

### POST `/uploads/complete`
Validates sizes, types, and counts of uploaded files.

**Request Body:**
```json
{
  "listingId": "e0a80202-5678-1234-abcd-9876543210fe",
  "files": [
    {
      "public_id": "stuflux/users/c0a8.../canon",
      "secure_url": "https://res.cloudinary.com/.../canon.jpg",
      "bytes": 256000,
      "width": 1920,
      "height": 1080,
      "mime_type": "image/jpeg"
    }
  ]
}
```

**Response:**
```json
{
  "files": [
    {
      "url": "https://res.cloudinary.com/.../canon.jpg",
      "secure_url": "https://res.cloudinary.com/.../canon.jpg",
      "width": 1920,
      "height": 1080,
      "size_kb": 250,
      "mime_type": "image/jpeg"
    }
  ]
}
```
*Note: The array returned in `files` can be sent directly inside the `photos` array when creating or updating a listing.*

---

## Bookings

Booking status transitions: `pending` → `confirmed` | `rejected` → `completed`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bookings` | 🔒 Required | Create a new booking request |
| GET | `/bookings` | 🔒 Required | Retrieve user's bookings (as owner or renter) |
| PATCH | `/bookings/:id/confirm` | 🔒 Required | Owner confirms a pending booking |
| PATCH | `/bookings/:id/reject` | 🔒 Required | Owner rejects a pending booking |
| GET | `/bookings/listings/:id/availability`| Optional | Retrieve confirmed booking dates and blocked dates |

### POST `/bookings`
Checks for conflicting confirmed bookings and manual blocked dates.

**Request Body:**
```json
{
  "listing_id": "e0a80202-5678-1234-abcd-9876543210fe",
  "start_date": "2026-07-15",
  "end_date": "2026-07-18",
  "message": "I will need it early in the morning."
}
```
*Note: `start_date` must be before `end_date`. The booking duration must fall within the listing's `min_rental_days` and `max_rental_days` parameters.*

**Response:**
```json
{
  "data": {
    "id": "f0a80303-1234-5678-abcd-1234567890ef",
    "listing_id": "e0a80202-5678-1234-abcd-9876543210fe",
    "renter_id": "c0a80101-1234-5678-abcd-1234567890ab",
    "owner_id": "d0a80101-5678-1234-abcd-8765432109ba",
    "start_date": "2026-07-15",
    "end_date": "2026-07-18",
    "total_days": 3,
    "total_amount": 750000,
    "status": "pending",
    "message": "I will need it early in the morning.",
    "security_deposit": 1000000,
    "delivery_fee": 50000,
    "confirmed_at": null,
    "rejected_at": null,
    "completed_at": null,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  }
}
```

### GET `/bookings`
**Query Parameters:**
- `role` — `"renter" | "owner"` (default: `"renter"`). Filter based on whether user is placing or receiving the booking.
- `status` — `"pending" | "confirmed" | "rejected" | "completed"` (optional).
- `listing_id` — UUID (optional). Filter by listing.
- `limit` — Number (default: `50`, max: `200`).

**Response:** `{ "data": [ BookingObject, ... ] }`

### PATCH `/bookings/:id/confirm`
Confirms a pending booking. Confirmed status locks dates, incrementing the listing's booking count.

**Response:** `{ "data": BookingObject }`

### PATCH `/bookings/:id/reject`
Rejects a pending booking.

**Response:** `{ "data": BookingObject }`

### GET `/bookings/listings/:id/availability`
Combines all confirmed bookings and manual blocked dates.

**Response:**
```json
{
  "data": [
    {
      "start_date": "2026-07-15",
      "end_date": "2026-07-18",
      "status": "confirmed"
    },
    {
      "start_date": "2026-07-20",
      "end_date": "2026-07-25",
      "status": "blocked"
    }
  ]
}
```

---

## Messages & Conversations

Mounted at root level (e.g., `/api/v1/messages`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/messages` | 🔒 Required | Send a message (creates a conversation if none exists) |
| GET | `/conversations` | 🔒 Required | List conversations for the authenticated user |
| GET | `/conversations/:id/messages` | 🔒 Required | Get messages in a conversation with pagination |
| GET | `/conversations/:id/stream` | 🔒 Required | Server-Sent Events (SSE) endpoint for real-time messages |
| POST | `/conversations/:id/seen` | 🔒 Required | Mark all messages in a conversation as read |
| DELETE | `/messages/:id` | 🔒 Required | Soft-delete a specific message |

### POST `/messages`
**Request Body:**
```json
{
  "body": "Hi, is this listing still available?",
  "listing_id": "e0a80202-5678-1234-abcd-9876543210fe",
  "conversation_id": "a0a80404-5678-1234-abcd-1234567890ef"
}
```
*Note: Body must be 1-1000 characters. Either `listing_id` or `conversation_id` must be provided.*

**Response:**
```json
{
  "data": {
    "id": "b0a80505-1234-5678-abcd-9876543210fe",
    "conversation_id": "a0a80404-5678-1234-abcd-1234567890ef",
    "sender_id": "c0a80101-1234-5678-abcd-1234567890ab",
    "body": "Hi, is this listing still available?",
    "delivered_at": null,
    "read_at": null,
    "created_at": "2026-07-13T12:01:00.000Z",
    "deleted_at": null
  }
}
```

### GET `/conversations`
**Response:**
```json
{
  "data": [
    {
      "id": "a0a80404-5678-1234-abcd-1234567890ef",
      "listing_id": "e0a80202-5678-1234-abcd-9876543210fe",
      "renter_id": "c0a80101-1234-5678-abcd-1234567890ab",
      "owner_id": "d0a80101-5678-1234-abcd-8765432109ba",
      "created_at": "2026-07-13T12:00:00.000Z",
      "updated_at": "2026-07-13T12:01:00.000Z"
    }
  ]
}
```

### GET `/conversations/:id/messages`
**Query Parameters:**
- `limit` — Number (default: `20`, max: `100`).
- `offset` — Number (default: `0`, max: `1000`).

**Response:** `{ "data": [ MessageObject, ... ] }`

### GET `/conversations/:id/stream`
An EventSource interface to subscribe to real-time events.
- Establishes a `text/event-stream` connection.
- Marks undelivered messages for the user in this conversation as delivered on connect.
- Fires `data` events containing JSON message objects as they arrive.
- Maintains a heartbeat keep-alive every 25 seconds.

### POST `/conversations/:id/seen`
Marks all received messages in the conversation as read.

**Response:** `{ "data": [ UpdatedMessageObject, ... ] }`

### DELETE `/messages/:id`
Soft-deletes a message (marks `deleted_at`).

**Response:** `{ "data": MessageObject }`

---

## Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/clerk` | Verification header | Handles webhook triggers from Clerk authentication |

### POST `/webhooks/clerk`
Synchronizes Clerk user records to the application database on `user.created` and `user.updated` events.

**Response:**
```json
{
  "received": true
}
```

---

## Error Handling

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input data",
    "timestamp": "2026-07-13T12:05:00.000Z",
    "path": "/api/v1/listings",
    "requestId": "req_1715684400000_abc123",
    "details": [
      {
        "field": "title",
        "message": "Should be at least 3 characters",
        "code": "too_small"
      }
    ]
  }
}
```
*Note: In `development` mode, a `debug` object is included inside `error` containing `technicalMessage`, `location` (filename and line number), `stack` trace, and request context.*

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | The request input failed validation (e.g. Zod validation) |
| `UNAUTHORIZED` | 401 | Missing or invalid auth header / Clerk authentication |
| `INVALID_TOKEN` | 401 | JWT token signature / verification failed |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `FORBIDDEN` | 403 | Authenticated user is not permitted to modify this resource |
| `RESOURCE_NOT_FOUND` | 404 | The requested entity does not exist |
| `ROUTE_NOT_FOUND` | 404 | The endpoint path does not exist |
| `DATABASE_UNAVAILABLE` | 503 | Database connection timeout or failure |
| `INTERNAL_ERROR` | 500 | An unexpected internal server error occurred |
