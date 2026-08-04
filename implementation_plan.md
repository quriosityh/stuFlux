# Authentication & Onboarding Implementation Plan

## Completed ✅

- Created this implementation tracker before code changes.
- Analyzed the web Clerk provider, sign-in/sign-up routes, middleware, onboarding flow, profile UI, and the users API module.
- Identified the current behavior: Google sign-in falls back to `/messages`; onboarding contains Clerk phone/SMS/OTP verification; profile exposes a separate phone verification modal; user sync creates a database user but does not track onboarding completion.
- Replaced phone/SMS/OTP onboarding with a two-field profile completion form and client/server validation states.
- Added an idempotent onboarding-completion API that persists the profile, sets the database completion flag, and synchronizes Clerk public metadata.
- Added a signed-in navigation guard and changed sign-in fallback behavior so Google and other sign-ins pass through the onboarding decision page.
- Removed the phone verification endpoint, repository/service logic, profile UI, modal, schema model, and seed/test references. Added a migration that retains completion for previously phone-verified users before dropping the obsolete table.
- Refreshed Clerk appearance settings and the sign-in/sign-up shells with responsive StuFlux branding and subtle entrance motion.
- Verified the migration journal is valid JSON, the migration diff has no whitespace errors, and runtime phone/SMS/OTP references are absent from API and web source.
- Passed targeted web linting for the new auth guard, onboarding flow, Clerk appearance, auth pages, and API client. The API user-module paths type-check cleanly within the full check output.
- Audited the My Listings page, listing card actions, edit route, listing form, and listings API/repository flow. Identified ownership/read, availability persistence, status preservation, and duplicate-refresh defects.
- Added an owner-only listing read endpoint for the edit route, preserving authorization and avoiding edit-page view-count mutations.
- Updated the listing editor to load existing blocked dates, save an empty blocked-date set when dates are removed, preserve paused/draft status on edit, and return owners to My Listings after a successful save.
- Removed the redundant client refresh that ran whenever an owner legitimately had no listings or bookings.
- Added the missing View Listing card action and separated draft status from paused status, with a clear Publish Listing action.
- Closed a public-detail authorization gap: inactive and draft listings are now visible only to their owner, and owner views do not increase public view counts.
- Verified focused linting for the changed My Listings, card action, editor, and owner-list hook paths with zero errors; verified the changed listings API paths produce no type-check errors; verified the full diff has no whitespace errors.
- Ran full TypeScript checks successfully for both the web and API applications.
- Audited notification delivery end to end. Confirmed SSE, push subscription, browser service worker, booking/message emitters, and email wiring; identified missing persistent inbox, incomplete cancellation coverage, and incomplete VAPID environment documentation.
- Added a persistent notifications database model, API endpoints for history/read state, and durable publishing that feeds the existing SSE stream.
- Added cancellation notifications to the in-app inbox, toast UI, Web Push, and email; documented VAPID server environment values.
- Passed full API and web TypeScript checks, focused notification UI linting, migration-journal JSON validation, and diff integrity checks after the notification changes.
- Diagnosed and repaired the onboarding/profile failure caused by unapplied schema migrations. Applied migrations `0008` and `0009` to the configured Neon database; profile UI now uses returned database data and meaningful API error responses.

## Pending ⏳

- Apply the new database migration in each deployed environment before releasing the web/API changes.
- Add browser-level regression coverage using a Clerk test tenant for Google first-login, completed-user sign-in, and mobile viewport behavior.
- Add integration/browser coverage for the My Listings authorization and edit flows using a configured database and Clerk test session.
- Apply migrations `0008` and `0009` in each deployed environment and configure the documented VAPID keys before release.
- Add integration/browser coverage for notification persistence, SSE reconnects, browser permission, and push delivery with a configured test database and Clerk session.
- Run browser smoke coverage with a Clerk test account for Google onboarding and profile edits on desktop and mobile.

## Known issues

- The application guard runs on the client because the existing middleware is Edge-based and has no database access. New sessions still land on `/onboarding` before reaching the application.
- The repository-wide web lint command still reports pre-existing errors outside the changed authentication/onboarding/listings paths.
- Live browser and database integration checks require a configured Clerk test session and test database; they were not run in this workspace.
- The SSE emitter remains process-local; use Redis or another shared pub/sub transport before horizontally scaling the API to multiple instances.

## Future improvements

- Add automated browser coverage for first-time Google sign-in and completed-user redirect behavior.
