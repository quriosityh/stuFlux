# Evaluation Demo Data

Run the baseline fixture command after migrations:

```bash
npm --prefix apps/api run db:seed
```

It creates eight Lahore users, thirty-three item-specific listings (at least four active listings in every category), and bookings across pending, confirmed, completed, rejected, and cancelled states. Completed rentals normally have two reviews, with three deliberate one-sided review scenarios to test the pending-review flow. The fixture is repeat-safe: it fills in only missing fixture records.

For sign-in accounts, run this once against a **development Clerk instance**:

```bash
npm --prefix apps/api run db:seed:accounts
```

This provisions the fixture users in Clerk and relinks the existing database rows so their rentals, inboxes, profiles, and reviews appear after sign-in. The command is deliberately blocked in production. It uses `Stufluxpass00*` by default; set `DEMO_ACCOUNT_PASSWORD` to replace it.

The most useful evaluator accounts are:

| Account | Email | Why use it |
| --- | --- | --- |
| Ayesha Khan | `ayesha@stuflux-demo.com` | Active lender with a pending generator request and one completed rental awaiting her review of Hamza. |
| Hamza Ahmed | `hamza@stuflux-demo.com` | Both rents and lends; has a completed projector rental awaiting his review of Hira. |
| Mahnoor Ali | `mahnoor@stuflux-demo.com` | Active renter with confirmed, pending, historic transactions, and one generator review still to submit for Ayesha. |

Listing photographs use fixed, curated Unsplash image URLs instead of a random-image endpoint, so the same product presentation stays consistent between evaluations.
