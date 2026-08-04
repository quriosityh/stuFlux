ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false;

UPDATE "users"
SET "onboarding_completed" = true
WHERE "id" IN (
  SELECT "user_id"
  FROM "user_verifications"
  WHERE "phone_verified" = true
);

DROP TABLE IF EXISTS "user_verifications";
