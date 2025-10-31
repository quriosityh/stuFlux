export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  daily_rate: number;
  city: string;
}
