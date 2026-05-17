# API Reference

Base URL: `http://localhost:4000/api/v1`

## Authentication

Most endpoints accept an optional `Authorization: Bearer <clerk_jwt_token>` header. Some endpoints **require** it (marked with 🔒).

The token is a short-lived JWT obtained via Clerk's `getToken()` on the frontend.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Returns API status |
| GET | `/health/db` | — | Tests database connection |

---

## Users

Mounted at root (`/api/v1/me`, not `/api/v1/users/me`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | 🔒 Required | Get current user's profile |
| PUT | `/me` | 🔒 Required | Update current user's profile |

**PUT `/me`** body:
```json
{
  "display_name": "string",
  "city": "string"
}
```

---

## Listings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/listings` | Optional | Browse/search listings |
| GET | `/listings/:id` | Optional | Get single listing by ID |
| GET | `/listings/owner/my` | 🔒 Required | Get current user's own listings |
| POST | `/listings` | 🔒 Required | Create a new listing |
| PUT | `/listings/:id` | 🔒 Required | Update a listing (owner only) |

**GET `/listings`** query params:
- `category` — Filter by category slug
- `city` — Filter by city
- `search` — Full-text search in title/description
- `status` — Filter by status (draft, active, inactive, archived)
- Pagination params (TBD — check controller for current implementation)

**POST `/listings`** body:
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category_id": "number (required)",
  "daily_rate": "number (required, in smallest currency unit)",
  "city": "string (required)",
  "address": "string (optional)",
  "status": "draft | active | inactive | archived",
  "specs": "object (optional, freeform JSON)",
  "min_rental_days": "number (default: 1)",
  "max_rental_days": "number (default: 30)",
  "delivery_available": "boolean (default: false)",
  "delivery_fee": "number (default: 0)",
  "security_deposit": "number (default: 0)"
}
```

---

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | Optional | List all categories |

**Response:**
```json
[
  { "id": 1, "name": "Cameras", "slug": "cameras", "description": "...", "icon": "📷" }
]
```

---

## Uploads

Image upload uses a **two-step flow**: get a signature, then upload directly to Cloudinary from the client, then confirm.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/uploads/signature` | 🔒 Required | Get Cloudinary upload signature |
| POST | `/uploads/complete` | 🔒 Required | Confirm upload, save photo record to DB |

**Flow:**
1. `POST /uploads/signature` → returns `{ signature, timestamp, cloudName, apiKey }`
2. Client uploads directly to Cloudinary using those credentials
3. `POST /uploads/complete` with Cloudinary response → saves `listing_photos` record

---

## Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bookings` | 🔒 Required | Create a booking request |
| GET | `/bookings` | 🔒 Required | List bookings (as renter or owner) |
| PATCH | `/bookings/:id/confirm` | 🔒 Required | Owner confirms a booking |
| PATCH | `/bookings/:id/reject` | 🔒 Required | Owner rejects a booking |
| GET | `/bookings/listings/:id/availability` | Optional | Check listing availability |

**POST `/bookings`** body:
```json
{
  "listing_id": "uuid (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD (required)",
  "message": "string (optional, note to owner)"
}
```

**Booking statuses:** `pending` → `confirmed` | `rejected` → `completed`

---

## Messages

Mounted at root (`/api/v1/messages`, `/api/v1/conversations`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/messages` | 🔒 Required | Send a message (creates conversation if needed) |
| GET | `/conversations` | 🔒 Required | List user's conversations |
| GET | `/conversations/:id/messages` | 🔒 Required | Get messages in a conversation |
| GET | `/conversations/:id/stream` | 🔒 Required | SSE stream for real-time messages |
| POST | `/conversations/:id/seen` | 🔒 Required | Mark conversation as read |
| DELETE | `/messages/:id` | 🔒 Required | Soft-delete a message |

**POST `/messages`** body:
```json
{
  "listing_id": "uuid (required — used to find/create conversation)",
  "body": "string (required)"
}
```

**SSE Stream (`/conversations/:id/stream`):**
- Opens a persistent connection
- Receives `message` events as JSON payloads
- Client should use `EventSource` API

---

## Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/clerk` | Clerk signature | Handles Clerk user events |

Handles `user.created` and `user.updated` events — syncs user data to our DB.

---

## Error Format

All errors follow this shape:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User-friendly message",
    "timestamp": "2026-05-14T12:00:00.000Z",
    "path": "/api/v1/listings/abc",
    "requestId": "req_1715..."
  }
}
```

### Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Zod validation failed (includes `details` array) |
| `UNAUTHORIZED` | 401 | No token or invalid token |
| `INVALID_TOKEN` | 401 | JWT verification failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested item doesn't exist |
| `ROUTE_NOT_FOUND` | 404 | Endpoint doesn't exist |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `DATABASE_UNAVAILABLE` | 503 | Can't connect to PostgreSQL |

In development mode, errors include a `debug` object with stack trace, technical message, and request context.
