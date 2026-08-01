# Local Development Setup

Get StuFlux running on your machine in ~10 minutes.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 18.0 | `node -v` |
| pnpm | ≥ 8.0 | `pnpm -v` |
| PostgreSQL | Any recent | `psql --version` |

## 1. Install Dependencies

```bash
# From monorepo root
pnpm install
```

This installs dependencies for all workspaces (`apps/api`, `apps/web`, `packages/types`).

## 2. Configure Environment Variables

### API (`apps/api/.env`)

Copy the example and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Where to get it | Example |
|----------|----------------|---------|
| `PORT` | Your choice | `4000` |
| `NODE_ENV` | Set to `development` | `development` |
| `DATABASE_URL` | Your local PostgreSQL | `postgresql://user:pass@localhost:5432/stuflux` |
| `DATABASE_SSL` | `false` for local | `false` |
| `CLERK_SECRET_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys | `pk_test_...` |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Console](https://console.cloudinary.com) | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary Console | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary Console | `abc123...` |
| `ALLOWED_ORIGINS` | Frontend URL | `http://localhost:3000` |

### Web (`apps/web/.env.local`)

Create this file:

```bash
# apps/web/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # Same as API's publishable key
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
```

## 3. Set Up Database

```bash
# Create the database (if it doesn't exist)
createdb stuflux

# Push schema to database (no migration files needed for dev)
pnpm -F api db:push

# Seed with sample data (categories, etc.)
pnpm -F api db:seed
```

## 4. Run

```bash
# From monorepo root — starts both API and Web concurrently
pnpm dev
```

This runs:
- **API**: `http://localhost:4000` (Express)
- **Web**: `http://localhost:3000` (Next.js)

## 5. Verify It Works

1. **API health**: Open `http://localhost:4000/api/v1/health` — should return `{ status: "ok" }`
2. **DB connection**: Open `http://localhost:4000/api/v1/health/db` — should confirm DB connection
3. **Web**: Open `http://localhost:3000` — should load the frontend

## Useful Commands

```bash
# Run only API
pnpm -F api dev

# Run only Web
pnpm -F web dev

# Run API tests
pnpm -F api test

# Generate a new DB migration
pnpm -F api db:generate

# Apply migrations
pnpm -F api db:migrate

# Open Drizzle Studio (DB browser)
pnpm -F api db:studio

# Type-check everything
pnpm type-check

# Lint everything
pnpm lint
```

## Common Issues

### `DATABASE_SSL` errors locally
Set `DATABASE_SSL=false` in your `.env`. SSL is only needed for remote/production databases (e.g., Neon, Supabase).

### Clerk webhook testing
For local development, Clerk webhooks won't reach your machine. Options:
- Use [ngrok](https://ngrok.com) to expose your local API
- Or rely on `ensureUserSynced()` — it auto-creates users on first API call, so webhooks aren't strictly required for dev

### `pnpm install` fails
Make sure you're using pnpm 8.x. The `packageManager` field in root `package.json` specifies `pnpm@8.15.0`.

### Port conflicts
API defaults to `:4000`, Web to `:3000`. If those are taken, update `PORT` in the API `.env` and `NEXT_PUBLIC_API_URL` in the Web `.env.local`.

### ESM import issues in API
The API uses ES modules (`"type": "module"`). All local imports must end with `.js` extension, even for `.ts` files. This is a TypeScript/Node ESM requirement.
