export interface ListingCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface ListingPhoto {
  url: string;
  thumbnail_url?: string;
  is_primary?: boolean;
}

export type ListingStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface OwnerListing {
  id: string;
  title: string;
  daily_rate: number;
  area: string;
  status: ListingStatus;
  view_count: number;
  category?: ListingCategory | null;
  photo?: ListingPhoto | null;
  created_at?: string;
}

/** Shape returned by GET /bookings?role=owner */
export interface OwnerBookingSnapshot {
  id: string;
  status: string;
  phase?: string;
  startDate: string;
  endDate: string;
  listing: {
    id: string;
    title: string;
    dailyRate: number;
    area: string;
    image?: string;
  };
}

export interface BlockedDateRange {
  start_date: string;
  end_date: string;
}

/** Combined availability from GET /bookings/listings/:id/availability */
export interface ListingAvailabilityRange extends BlockedDateRange {
  status: 'confirmed' | 'blocked';
}

export type ListingFilter = 'all' | 'active' | 'paused';
