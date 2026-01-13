CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed');

CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    renter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    total_amount integer NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    message text,
    security_deposit integer DEFAULT 0,
    delivery_fee integer DEFAULT 0,
    confirmed_at timestamptz,
    rejected_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_listing_confirmed ON bookings (listing_id) WHERE status = 'confirmed';
CREATE INDEX idx_bookings_renter ON bookings (renter_id);
CREATE INDEX idx_bookings_owner ON bookings (owner_id);
