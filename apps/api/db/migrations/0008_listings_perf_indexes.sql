-- Performance indexes for the home page listings query
-- The browse/discovery query filters on status='active', joins categories by slug,
-- orders by (booking_count * 3 + view_count) / age, and paginates.
-- Without these indexes every page load does a sequential scan of the full listings table.

-- 1. Most important: composite index for the primary browse filter + sort direction
--    Covers: WHERE status = 'active' ORDER BY created_at DESC (newest sort)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_created_at
    ON listings (status, created_at DESC);

-- 2. Covers filtering by category_id (used with status filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_category
    ON listings (status, category_id);

-- 3. Covers ordering by booking_count for popular sort (partial index, active only)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_active_booking_count
    ON listings (booking_count DESC, view_count DESC)
    WHERE status = 'active';

-- 4. Speeds up the COUNT(*) sub-query that runs alongside every browse query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status
    ON listings (status);

-- 5. Listing photos join: listing_id + is_primary + deleted_at IS NULL
--    This is hit on EVERY listing card rendered (primary photo lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listing_photos_primary
    ON listing_photos (listing_id, is_primary)
    WHERE deleted_at IS NULL;

-- 6. Categories slug lookup (used in buildWhere for category filter)
--    Already unique-indexed but a plain index is faster for non-unique reads
--    on older Postgres versions. No-op if the unique index already covers it.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug
    ON categories (slug);
