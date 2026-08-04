# Profile Management Recovery Checklist

## ✅ Completed tasks

- Traced the Clerk browser token → Next proxy → Express `requireAuth` → database user lookup → users controller/service/repository flow.
- Verified client requests use the Clerk session token and the Next proxy replaces browser-provided authorization with the server-authenticated Clerk token.
- Verified onboarding and profile edit use the same authenticated `/users/me` API path and database user UUID resolved from the Clerk user ID.
- Identified the primary root cause: the application code references `users.onboarding_completed`, added in migration `0008`, so an environment where that migration was not applied fails `GET /users/me` and profile update `RETURNING` queries.
- Applied and re-verified migrations `0008` and `0009` against the configured Neon database.
- Passed full web/API TypeScript checks and focused onboarding/profile linting with no errors.

## Root cause found

- Database schema drift: web/API code was deployed ahead of migration `0008_onboarding_and_remove_phone_verification.sql`.
- The UI discarded API response details, masking the server-side error as generic onboarding/profile failures.

## Bugs fixed

- Applied migrations `0008_onboarding_and_remove_phone_verification` and `0009_persist_notifications` to the configured database.
- Updated profile saves to use the API’s returned database record for immediate UI state, refresh server-rendered data, and surface meaningful API errors.
- Updated onboarding to render API error messages rather than hide them behind a generic failure.
- Refresh the user-sync cache after profile updates so request-scoped auth sync cannot serve stale user details.

## Files modified

- `apps/api/src/modules/users/controller.ts`
- `apps/api/src/modules/users/service.ts`
- `apps/web/src/components/onboarding/OnboardingFlow.tsx`
- `apps/web/src/components/profile/EditProfileForm.tsx`
- `apps/api/src/infra/http/middleware/auth.ts`

## ⏳ Remaining tasks

- Run browser smoke tests with a Clerk test account for first-time Google sign-in, onboarding submission, profile editing, refresh persistence, and mobile viewport behavior.
- Run type/lint and migration checks.
