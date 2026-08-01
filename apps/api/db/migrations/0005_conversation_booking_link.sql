-- Migration: conversation-per-booking architecture
--
-- Changes:
--   1. Add booking_id (nullable FK → bookings.id) to conversations
--   2. Drop the old broad unique constraint (listing_id, renter_id)
--   3. Add partial unique index: only ONE inquiry thread per (listing_id, renter_id)
--      Booking threads (booking_id IS NOT NULL) have no such restriction.

--> statement-breakpoint
ALTER TABLE "conversations"
    ADD COLUMN IF NOT EXISTS "booking_id" uuid
    REFERENCES "public"."bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "conversations"
    DROP CONSTRAINT IF EXISTS "conversations_listing_id_renter_id_unique";

--> statement-breakpoint
-- Partial unique: deduplicate inquiry threads only
CREATE UNIQUE INDEX "conversations_inquiry_unique_idx"
    ON "conversations" ("listing_id", "renter_id")
    WHERE "booking_id" IS NULL;

--> statement-breakpoint
-- Index for fast booking-thread lookup
CREATE INDEX "conversations_booking_id_idx"
    ON "conversations" ("booking_id")
    WHERE "booking_id" IS NOT NULL;
