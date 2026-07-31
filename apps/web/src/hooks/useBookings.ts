import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

export interface Booking {
  id: string;
  phase: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
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
  conversation_id: string | null;
  created_at: string;
}

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
        throw new Error('Failed to fetch bookings');
      }

      const payload = (await res.json()) as { data: any[] };
      const formatted = payload.data.map((b: any) => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      }));

      setBookings(formatted);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [role, getToken]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings, userId]);

  const confirmBooking = async (bookingId: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/proxy/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      void fetchBookings();
      return true;
    }
    return false;
  };

  const rejectBooking = async (bookingId: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/proxy/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      void fetchBookings();
      return true;
    }
    return false;
  };

  const cancelBooking = async (bookingId: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/proxy/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      void fetchBookings();
      return true;
    }
    return false;
  };

  const completeBooking = async (bookingId: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/proxy/bookings/${bookingId}/complete`, {
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
    confirmBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
  };
}
