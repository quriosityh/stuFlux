'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Package, Loader2, AlertCircle } from 'lucide-react';
import { MyListingCard } from './MyListingCard';
import { ManageAvailabilityModal } from './ManageAvailabilityModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useApiClient } from '@/lib/api-client';

interface ListingPhoto {
  url: string;
  thumbnail_url?: string;
}

interface ListingCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface MyListing {
  id: string;
  title: string;
  daily_rate: number;
  area: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  view_count: number;
  category?: ListingCategory;
  photo?: ListingPhoto | null;
}

interface Booking {
  id: string;
  listing_id: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface ListingsClientProps {
  initialListings: MyListing[];
  initialBookings: Booking[];
}

export function ListingsClient({ initialListings, initialBookings }: ListingsClientProps) {
  const api = useApiClient();
  const [listings, setListings] = useState<MyListing[]>(initialListings);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  
  // Filter chips: 'all' | 'active' | 'paused'
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  
  // Modal states
  const [availabilityModal, setAvailabilityModal] = useState<{ id: string; title: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);

  const fetchLatestData = async () => {
    setLoading(true);
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        api.get('listings/owner/my?limit=100').json<{ data: MyListing[] }>(),
        api.get('bookings?role=owner&limit=200').json<{ data: Booking[] }>()
      ]);
      setListings(listingsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error refreshing listings data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive active / pending requests for each listing
  const pendingCountsMap = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.status === 'pending') {
        counts[b.listing_id] = (counts[b.listing_id] || 0) + 1;
      }
    });
    return counts;
  }, [bookings]);

  // Derive ongoing / Out on rental state for each listing
  const outOnRentalMap = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const map: Record<string, boolean> = {};
    bookings.forEach((b) => {
      if (b.status === 'confirmed') {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        if (today >= start && today <= end) {
          map[b.listing_id] = true;
        }
      }
    });
    return map;
  }, [bookings]);

  // Filter listings (exclude archived)
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.status !== 'archived')
      .filter((l) => {
        if (filter === 'active') return l.status === 'active';
        if (filter === 'paused') return l.status === 'inactive';
        return true;
      });
  }, [listings, filter]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto px-4 pt-6 sm:pt-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">LISTINGS</h1>
            <p className="text-xs text-[var(--foreground)]/50 font-medium mt-1">
              Manage your rental warehouse, pricing, and availability
            </p>
          </div>
          
          <Link
            href={"/listings/new" as any}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl hyper-liquid text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
          >
            <Plus size={15} />
            List New Item
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-black border-transparent shadow-sm'
                : 'bg-[var(--surface)] border-[var(--border-color)] text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === 'active'
                ? 'bg-[var(--accent)] text-black border-transparent shadow-sm'
                : 'bg-[var(--surface)] border-[var(--border-color)] text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === 'paused'
                ? 'bg-[var(--accent)] text-black border-transparent shadow-sm'
                : 'bg-[var(--surface)] border-[var(--border-color)] text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
            }`}
          >
            Paused
          </button>

          {loading && (
            <Loader2 size={16} className="animate-spin text-[var(--foreground)]/40 ml-2" />
          )}
        </div>

        {/* Grid List */}
        {filteredListings.length === 0 ? (
          <div className="chrome-card rounded-3xl p-16 text-center border border-[var(--border-color)]/70 bg-[var(--surface)]/30">
            <Package size={44} className="mx-auto text-[var(--foreground)]/20 mb-4" />
            <p className="font-display text-base font-bold text-[var(--foreground)]/60">
              No listings found
            </p>
            <p className="text-xs text-[var(--foreground)]/40 mt-1 max-w-sm mx-auto">
              {filter === 'all' 
                ? 'You haven\'t listed any items for rent yet. Put your idle gear to work!'
                : `No listings with "${filter}" status. Click List New Item to post.`
              }
            </p>
            {filter === 'all' && (
              <Link
                href={"/listings/new" as any}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-5 bg-[var(--accent)] text-black text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Create your first listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map((listing) => (
              <MyListingCard
                key={listing.id}
                listing={listing}
                pendingRequestsCount={pendingCountsMap[listing.id] || 0}
                isOutOnRental={!!outOnRentalMap[listing.id]}
                onRefresh={fetchLatestData}
                onManageAvailability={(id, title) => setAvailabilityModal({ id, title })}
                onDelete={(id, title) => setDeleteModal({ id, title })}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {availabilityModal && (
          <ManageAvailabilityModal
            listingId={availabilityModal.id}
            listingTitle={availabilityModal.title}
            onClose={() => setAvailabilityModal(null)}
          />
        )}

        {deleteModal && (
          <DeleteConfirmationModal
            listingId={deleteModal.id}
            listingTitle={deleteModal.title}
            onClose={() => setDeleteModal(null)}
            onDeleted={() => {
              setDeleteModal(null);
              fetchLatestData();
            }}
          />
        )}

      </div>
    </div>
  );
}
