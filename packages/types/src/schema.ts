// Re-export types from Drizzle schema
import type { 
  users,
  categories,
  listings,
  // listing_images,
  // bookings,
  // unavailable_dates
} from '../../../apps/api/src/db/schema';

// Infer types from Drizzle schema
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Listing = typeof listings.$inferSelect;
// export type ListingImage = typeof listing_images.$inferSelect;
// export type Booking = typeof bookings.$inferSelect;
// export type UnavailableDate = typeof unavailable_dates.$inferSelect;

// Input types for creation/updates
export type CreateListingInput = Omit<Listing, 'id' | 'created_at' | 'updated_at'>;
export type UpdateListingInput = Partial<CreateListingInput>;

// Relationship types
export interface ListingWithDetails extends Listing {
  owner: Pick<User, 'id' | 'name' | 'avatar_url'>;
  category: Category;
  images: ListingImage[];
}

// Query filter types
export interface ListingFilters {
  city?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  start_date?: Date;
  end_date?: Date;
  delivery_available?: boolean;
}
