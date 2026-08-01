# AI Agent Instructions

Rules for AI coding assistants working on this project. Read this before writing any code.

## Before You Start

1. **Read `ARCHITECTURE.md`** — Understand how the system is structured
2. **Read `CONVENTIONS.md`** — Follow existing patterns, don't invent new ones
3. **Check `PROJECT.md`** — Know what's done and what's left
4. **Check `API.md`** — Know the existing endpoints before adding new ones

## Golden Rules

### Follow Existing Patterns
- New API modules use the **flat structure** (routes → controller → service → repository). Don't use the layered architecture from the `listings` module
- Use the existing `api-client.ts` for frontend API calls. Don't create new fetch/axios wrappers
- Use `AppError` / `ErrorUtils` for error handling. Don't try-catch and re-throw generic errors
- Use Zod schemas + `validate()` middleware for request validation

### Don't Break What Works
- **Don't refactor existing working code** unless explicitly asked
- **Don't change the middleware stack order** in `app.ts` — it's carefully sequenced
- **Don't modify `db/schema.ts`** without creating a proper migration
- **Don't change auth patterns** — the `requireAuth`/`optionalAuth` system is intentional

### Dependencies
- **Don't install new packages** without checking if something similar already exists in `package.json`
- If you must add a dependency, explain why in your response
- Prefer the existing stack: Radix UI for primitives, Lucide for icons, Zod for validation, ky for HTTP

### Code Quality
- Use TypeScript strictly — no `any` types unless absolutely necessary
- API imports must end with `.js` extension (ESM requirement)
- Frontend imports use `@/` path alias
- Keep controllers thin — business logic belongs in services

## When Making Changes

### Adding a New API Endpoint
1. Add route to the appropriate module's `routes.ts`
2. Create controller handler using the `[requireAuth, validate(...), asyncHandler(...)]` pattern
3. Add business logic in `service.ts`
4. Add DB queries in `repository.ts`
5. Add Zod validation schema in `validations.ts`
6. **Update `docs/API.md`** with the new endpoint

### Modifying the Database Schema
1. Edit `apps/api/db/schema.ts`
2. Run `pnpm -F api db:generate` to create a migration
3. Run `pnpm -F api db:migrate` to apply it
4. Update the tables section in `docs/ARCHITECTURE.md`

### Adding a Frontend Page
1. Create the route under `apps/web/src/app/<route>/page.tsx`
2. Use App Router conventions (layout.tsx, loading.tsx, error.tsx as needed)
3. Use `useApiClient()` hook in client components, `createServerApiClient()` in server components
4. Use existing Tailwind patterns and Radix UI primitives

## When You're Unsure

- Add a `// TODO:` comment explaining what you're unsure about — don't guess
- If making a non-obvious architectural choice, add an entry to `docs/DECISIONS.md`
- If you encounter a bug or gotcha, document it in `docs/SETUP.md` under "Common Issues"

## Testing

- API tests use Jest + Supertest
- Test files go in `apps/api/tests/`
- Run tests: `pnpm -F api test`
- **Always verify your changes don't break existing tests** before marking work as done

## What NOT to Do

- ❌ Don't create files outside the established folder structure
- ❌ Don't hardcode secrets, API URLs, or environment-specific values
- ❌ Don't add console.log for debugging and leave it in — use the existing Morgan logger
- ❌ Don't create separate config files for things that belong in existing config
- ❌ Don't convert the project to CommonJS — it's ESM and staying ESM
- ❌ Don't add a new ORM, API client, or CSS framework alongside existing ones
