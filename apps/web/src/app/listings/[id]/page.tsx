import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api-client';
import PDPClient from '@/components/pdp/PDPClient';
import { auth } from '@clerk/nextjs/server';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  const api = await createServerApiClient(token ?? undefined);

  let listing = null;
  let availability = [];

  try {
    const listingResponse = await api.get(`listings/${id}`).json<{ data: any }>();
    listing = listingResponse.data;
    
    // Force 5 photos for UI testing if the API returns fewer
    if (!listing.photos || listing.photos.length < 5) {
      listing.photos = [
        { id: 1, url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", is_primary: true },
        { id: 2, url: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 3, url: "https://images.unsplash.com/photo-1621644788390-e2d6b38c0397?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 4, url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 5, url: "https://images.unsplash.com/photo-1495121553079-4c61bcce18bf?auto=format&fit=crop&w=800&q=80", is_primary: false },
      ];
    }
  } catch (error: any) {
    console.log("API failed, using mock data for PDP");
    listing = {
      id: id,
      title: "Sony A7IV Mirrorless Camera with 24-70mm Lens",
      description: "Professional grade mirrorless camera perfect for both photos and video. Excellent condition. Includes: Camera body, 24-70mm f/2.8 lens, 3 batteries, dual charger, 128GB SD card, carrying bag.\n\nSpecs:\nBrand: Sony\nModel: A7IV\nSensor: 33MP Full-Frame",
      daily_rate: 2500,
      min_rental_days: 2,
      max_rental_days: 14,
      security_deposit: 5000,
      delivery_available: true,
      city: "Johar Town, Lahore",
      category: {
        name: "Cameras & Lenses",
        slug: "cameras"
      },
      owner: {
        display_name: "Ali Hassan",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        city: "Johar Town, Lahore",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
      },
      photos: [
        { id: 1, url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", is_primary: true },
        { id: 2, url: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 3, url: "https://images.unsplash.com/photo-1621644788390-e2d6b38c0397?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 4, url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80", is_primary: false },
        { id: 5, url: "https://images.unsplash.com/photo-1495121553079-4c61bcce18bf?auto=format&fit=crop&w=800&q=80", is_primary: false },
      ]
    };
  }

  try {
    const availResponse = await api.get(`bookings/listings/${id}/availability`).json<any[]>();
    availability = availResponse;
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    // Continue without availability, PDP client can handle empty array
  }

  return (
    <div className="bg-background min-h-screen">
      <PDPClient listing={listing} availability={availability} />
    </div>
  );
}
