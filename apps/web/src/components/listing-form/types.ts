export interface ListingFormData {
  title: string;
  description: string;
  category_id: number;
  daily_rate: number;
  city: string;
  address?: string;
  status: 'draft' | 'active';
  condition?: 'New' | 'Like new' | 'Used' | 'Damaged';
  specs?: Record<string, string>;
  min_rental_days: number;
  max_rental_days: number;
  delivery_available: boolean;
  delivery_fee: number;
  security_deposit: number;
  photo_urls: string[];
}
