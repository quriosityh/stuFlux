export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';

export interface ActivityBooking {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: BookingStatus;
  message: string | null;
  created_at: string;
  listing: {
    title: string;
    daily_rate: number;
    city: string;
  };
  listing_photo: {
    url: string | null;
  } | null;
  renter: {
    display_name: string;
    avatar_url: string | null;
  };
  owner: {
    display_name: string;
    avatar_url: string | null;
  };
}

export interface BookingsResponse {
  data: ActivityBooking[];
}