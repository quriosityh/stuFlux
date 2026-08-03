-- Full-text index for the header's "What" search. The indexed expression must
-- remain identical to the expression in listingsRepository.buildWhere.
CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON listings
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')))
  WHERE status = 'active';
