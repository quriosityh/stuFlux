CREATE UNIQUE INDEX IF NOT EXISTS "user_verifications_user_id_unique" ON "user_verifications" USING btree ("user_id");
