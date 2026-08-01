/**
 * A photo object as returned by POST /uploads/complete.
 * This is the shape stored in wizard state and sent to the listings API.
 */
export interface PhotoObject {
  url: string;
  secure_url?: string;
  width?: number;
  height?: number;
  size_kb?: number;
  mime_type?: string;
}

export interface ListingFormData {
  // Step 1: Photos
  photos: PhotoObject[];

  // Step 2: Category + Title
  category_id: number;
  title: string;

  // Step 3: Description, Condition, Specs
  description: string;
  condition: 'like_new' | 'good' | 'fair' | 'well_used' | '';
  specs: Record<string, string>;

  // Step 4: Pricing + Terms
  daily_rate: number;
  security_deposit: number;
  min_rental_days: number;
  max_rental_days: number;
  delivery_available: boolean;
  delivery_fee: number;
  rental_rules: string;

  // Step 5: Area
  area: string; // Lahore Area ID

  // Step 6: Availability
  blocked_dates: { start_date: string; end_date: string }[];

  // Internal
  status: 'draft' | 'active';
}
