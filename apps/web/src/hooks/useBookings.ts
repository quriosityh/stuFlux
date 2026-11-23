import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

export interface Booking {
  id: string;
  phase: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  status: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  deliveryType: 'pickup' | 'delivery';
  message: string | null;
  listing: {
    id: string;
    title: string;
    dailyRate: number;
    area: string;
    image: string;
    rules: string[];
  };
  counterpart: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    phone: string;
    joined: string;
    completedRentals: number;
  };
  financials: {
    rentTotal: number;
    deliveryFee: number;
    securityDeposit: number;
  };
  hasReviewed?: boolean;
  conversation_id: string | null;
  created_at: string;
}

type ApiBooking = Omit<Booking, 'startDate' | 'endDate'> & {
  startDate: string;
  endDate: string;
};

export function useBookings(role: 'renter' | 'owner') {
  const { getToken, userId } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/proxy/bookings?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message ?? 'Failed to fetch bookings');
      }

      const payload = (await res.json()) as { data?: unknown };
      if (!Array.isArray(payload.data)) {
        throw new Error('The bookings service returned an invalid response');
      }
      const formatted: Booking[] = (payload.data as ApiBooking[]).map((b) => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      }));

      setBookings(formatted);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bookings'));
    } finally {
      setIsLoading(false);
    }
  }, [role, getToken]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings, userId]);

  const updateBooking = async (bookingId: string, action: 'confirm' | 'reject' | 'cancel' | 'complete') => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/proxy/bookings/${bookingId}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      void fetchBookings();
      return true;
    }
    return false;
  };

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    confirmBooking: (bookingId: string) => updateBooking(bookingId, 'confirm'),
    rejectBooking: (bookingId: string) => updateBooking(bookingId, 'reject'),
    cancelBooking: (bookingId: string) => updateBooking(bookingId, 'cancel'),
    completeBooking: (bookingId: string) => updateBooking(bookingId, 'complete'),
  };
}
