# Coding Conventions

Rules and patterns used in this codebase. Follow these to keep things consistent.

## API (Express Backend)

### Module Structure

New feature modules go in `apps/api/src/modules/<module-name>/` with these files:

```
modules/my-feature/
├── routes.ts         ← Express Router, endpoint definitions
├── controller.ts     ← Request handling, calls service, sends response
├── service.ts        ← Business logic (no req/res here)
├── repository.ts     ← Database queries (Drizzle ORM)
├── validations.ts    ← Zod schemas for request body/params
├── types.ts          ← Module-specific types (if needed)
└── index.ts          ← Re-exports routes: `export default routes`
```

**Don't** use the layered architecture (application/domain/infrastructure/interfaces) that the `listings` module has — that was an early experiment. Use the flat structure above.

### Controller Pattern

Controllers use `asyncHandler` wrapper and spread syntax for middleware chains:

```typescript
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { requireAuth, AuthenticatedRequest } from '../../infra/http/middleware/auth.js';
import { validate } from '../../config/validate.js';
import { createThingSchema } from './validations.js';
import * as service from './service.js';

export const createThingHandler = [
  requireAuth,
  validate(createThingSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await service.createThing(req.auth!.userId, req.body);
    res.status(201).json(result);
  }),
];
```

### Error Handling

- **Never** catch errors in controllers/services just to re-throw generic errors
- Use `AppError` or `ErrorUtils` from `src/common/errors.ts`
- Let the centralized `errorHandler` middleware handle everything
- Zod validation errors are auto-caught and formatted

```typescript
import { AppError, ErrorUtils } from '../../common/errors.js';

// Specific errors
throw ErrorUtils.notFound('Listing', id);
throw ErrorUtils.unauthorized('delete_listing');
throw ErrorUtils.validation('End date must be after start date');

// Custom errors
throw new AppError('Custom message', 409, 'CONFLICT');
```

### Database Queries

- All DB access goes through `repository.ts` files
- Use Drizzle query builder, not raw SQL
- Import schema from `../../../db/schema.js` (with `.js` extension!)
- Import db instance from `../../infra/db/index.js`

### Import Extensions

**The API uses ES Modules.** All local imports must have `.js` extension:

```typescript
// ✅ Correct
import { users } from '../../../db/schema.js';
import { requireAuth } from '../../infra/http/middleware/auth.js';

// ❌ Wrong — will fail at runtime
import { users } from '../../../db/schema';
import { requireAuth } from '../../infra/http/middleware/auth';
```

### Validation

Use Zod schemas in `validations.ts`, apply via `validate()` middleware from `src/config/validate.ts`:

```typescript
// validations.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  listing_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  message: z.string().optional(),
});
```

---

## Frontend (Next.js)

### File & Folder Naming

- **Pages/Routes**: Follow Next.js App Router conventions — `app/route-name/page.tsx`
- **Components**: PascalCase files — `ListingCard.tsx`, `BookingForm.tsx`
- **Utilities/hooks**: camelCase files — `useApiClient.ts`, `formatDate.ts`
- **CSS**: kebab-case — `globals.css`

### API Calls

Two patterns depending on where you are:

```typescript
// Client Components — use the hook
'use client';
import { useApiClient } from '@/lib/api-client';

function MyComponent() {
  const api = useApiClient();
  
  const fetchData = async () => {
    const data = await api.get('listings').json();
  };
}
```

```typescript
// Server Components — use the factory
import { createServerApiClient } from '@/lib/api-client';
import { auth } from '@clerk/nextjs/server';

async function MyServerComponent() {
  const { getToken } = await auth();
  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);
  
  const data = await api.get('listings').json();
}
```

**Don't** create new fetch wrappers or axios instances. Use the existing `api-client.ts`.

### Path Aliases

The frontend uses `@/` to alias `src/`:

```typescript
import { useApiClient } from '@/lib/api-client';  // = src/lib/api-client
```

### Styling

- Tailwind CSS v4 (utility-first)
- `clsx` + `tailwind-merge` for conditional classes
- `class-variance-authority` (cva) for component variants
- Radix UI for accessible primitives (Dialog, Select, Toast)
- Lucide React for icons

---

## Git Workflow

### Branches

- `main` — Production-ready baseline (rarely touched directly)
- `develop` — Active development branch (PRs go here)
- `feature/<name>` — Feature branches (branch off `develop`)
- `fix/<name>` — Bug fix branches
- `tests/<name>` — Test-only branches

### Branch Flow

```
feature/my-thing → PR → develop → (release) → main
```

### Commits

Keep commits descriptive. Avoid one-word messages like `fix` or `wip`.

```bash
# ✅ Good
git commit -m "Add booking availability check endpoint"
git commit -m "Fix SSE stream disconnection on auth expiry"

# ❌ Bad
git commit -m "fix"
git commit -m "wip"
git commit -m "stuff"
```

### Before Pushing

```bash
# Type-check
pnpm type-check

# Run tests
pnpm -F api test

# Lint
pnpm lint
```
