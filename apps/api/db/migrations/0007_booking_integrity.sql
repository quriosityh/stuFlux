-- Keep the database model aligned with the booking service and prevent
-- concurrent confirmations from reserving the same listing dates.

--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'cancelled';

--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;

--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;

--> statement-breakpoint
ALTER TABLE "bookings"
  DROP CONSTRAINT IF EXISTS "bookings_confirmed_dates_do_not_overlap";

--> statement-breakpoint
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_confirmed_dates_do_not_overlap"
  EXCLUDE USING gist (
    "listing_id" WITH =,
    daterange("start_date", "end_date", '[)') WITH &&
  ) WHERE ("status" = 'confirmed');
