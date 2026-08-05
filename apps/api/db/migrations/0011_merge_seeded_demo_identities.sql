-- Demo bookings were seeded under user_dev_* identities before real Clerk
-- users signed in. Consolidate each seeded profile into the real account with
-- the same email so all bookings, messages, and review eligibility remain
-- visible to the signed-in person.
DO $$
DECLARE
  identity_pair RECORD;
  conversation_pair RECORD;
BEGIN
  FOR identity_pair IN
    SELECT legacy.id AS legacy_id, current.id AS current_id
    FROM users AS legacy
    JOIN users AS current
      ON lower(legacy.email) = lower(current.email)
    WHERE legacy.clerk_user_id LIKE 'user_dev_%'
      AND current.clerk_user_id NOT LIKE 'user_dev_%'
  LOOP
    -- A real user may already have reviewed a booking that was also reviewed
    -- by their seeded account. Keep the real-account review before remapping.
    DELETE FROM reviews AS legacy_review
    USING reviews AS current_review
    WHERE legacy_review.reviewer_id = identity_pair.legacy_id
      AND current_review.reviewer_id = identity_pair.current_id
      AND legacy_review.booking_id = current_review.booking_id;

    -- Inquiry conversations are unique per listing/renter. Merge messages into
    -- the real-account conversation before changing the renter identity.
    FOR conversation_pair IN
      SELECT legacy_conversation.id AS legacy_conversation_id,
             current_conversation.id AS current_conversation_id
      FROM conversations AS legacy_conversation
      JOIN conversations AS current_conversation
        ON current_conversation.listing_id = legacy_conversation.listing_id
       AND current_conversation.renter_id = identity_pair.current_id
       AND current_conversation.booking_id IS NULL
      WHERE legacy_conversation.renter_id = identity_pair.legacy_id
        AND legacy_conversation.booking_id IS NULL
    LOOP
      UPDATE messages
      SET conversation_id = conversation_pair.current_conversation_id
      WHERE conversation_id = conversation_pair.legacy_conversation_id;

      DELETE FROM conversations
      WHERE id = conversation_pair.legacy_conversation_id;
    END LOOP;

    UPDATE listings SET owner_id = identity_pair.current_id WHERE owner_id = identity_pair.legacy_id;
    UPDATE bookings SET renter_id = identity_pair.current_id WHERE renter_id = identity_pair.legacy_id;
    UPDATE bookings SET owner_id = identity_pair.current_id WHERE owner_id = identity_pair.legacy_id;
    UPDATE conversations SET renter_id = identity_pair.current_id WHERE renter_id = identity_pair.legacy_id;
    UPDATE conversations SET owner_id = identity_pair.current_id WHERE owner_id = identity_pair.legacy_id;
    UPDATE messages SET sender_id = identity_pair.current_id WHERE sender_id = identity_pair.legacy_id;
    UPDATE reviews SET reviewer_id = identity_pair.current_id WHERE reviewer_id = identity_pair.legacy_id;
    UPDATE reviews SET target_id = identity_pair.current_id WHERE target_id = identity_pair.legacy_id;
    UPDATE push_subscriptions SET user_id = identity_pair.current_id WHERE user_id = identity_pair.legacy_id;

    IF to_regclass('public.user_verifications') IS NOT NULL THEN
      EXECUTE 'DELETE FROM user_verifications legacy_verification USING user_verifications current_verification WHERE legacy_verification.user_id = $1 AND current_verification.user_id = $2'
        USING identity_pair.legacy_id, identity_pair.current_id;
      EXECUTE 'UPDATE user_verifications SET user_id = $1 WHERE user_id = $2'
        USING identity_pair.current_id, identity_pair.legacy_id;
    END IF;

    DELETE FROM users WHERE id = identity_pair.legacy_id;
  END LOOP;
END $$;
