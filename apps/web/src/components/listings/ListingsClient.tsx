'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Package, Loader2, Sparkles, ArrowRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { MyListingCard } from './MyListingCard';
import { ManageAvailabilityModal } from './ManageAvailabilityModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useOwnerListings } from '@/hooks/useOwnerListings';
import type { OwnerBookingSnapshot, OwnerListing } from '@/lib/listings/types';
import { cn } from '@/lib/utils';

interface ListingsClientProps {
  initialListings: OwnerListing[];
  initialBookings: OwnerBookingSnapshot[];
  initialError?: string | null;
}

export function ListingsClient({
  initialListings,
  initialBookings,
  initialError = null,
}: ListingsClientProps) {
  const router = useRouter();
  const {
    loading,
    error,
    filter,
    setFilter,
    refresh,
    patchListing,
    removeListing,
    filteredListings,
    pendingCountsMap,
    outOnRentalMap,
    activeCount,
    pausedCount,
    pendingRequestsTotal,
    bookings,
  } = useOwnerListings({ initialListings, initialBookings });

  const [availabilityModal, setAvailabilityModal] = useState<{ id: string; title: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);

  const displayError = initialError ?? error;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,247,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(0,112,255,0.12),transparent_30%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.24))]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:pb-12 sm:pt-20 lg:px-6 lg:pt-24">
        <div className="rounded-[32px] border border-[var(--border-color)]/70 bg-[var(--surface)]/72 px-5 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                      return;
                    }
                    router.push('/explore');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--foreground)]/45 transition-colors hover:text-[var(--foreground)]"
                >
                  <ChevronLeft size={13} />
                  Back
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/55 lg:hidden">
                  <Sparkles size={11} className="text-[var(--accent)]" />
                  Owner storefront
                </div>
              </div>

              <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/55">
                <Sparkles size={11} className="text-[var(--accent)]" />
                Owner storefront
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.05]">
                  LISTINGS
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-[var(--foreground)]/55 sm:text-[15px]">
                  Manage your inventory, price changes, availability, and status from one clean dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70">
                  {filteredListings.length} visible
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70">
                  {activeCount} active
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70">
                  {pausedCount} paused
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)]/70 bg-[var(--background)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70">
                  {pendingRequestsTotal} pending requests
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:min-w-[250px] lg:max-w-[290px] lg:items-end lg:justify-self-end">
              <Link
                href={"/listings/new" as any}
                className="inline-flex items-center justify-center gap-2 rounded-2xl hyper-liquid px-5 py-3 text-sm font-bold shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5 hover:opacity-95 lg:min-w-[220px]"
              >
                <Plus size={16} />
                List New Item
                <ArrowRight size={15} />
              </Link>
              <p className="max-w-[260px] text-xs leading-5 text-[var(--foreground)]/45 lg:text-right">
                Quick edits, pause/resume controls, and availability management live here.
              </p>
            </div>
          </div>

          {displayError && (
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{displayError}</p>
                <button
                  type="button"
                  onClick={refresh}
                  className="mt-1 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--border-color)]/60 bg-[var(--background)]/55 p-2.5 sm:p-3">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-2xl border px-4 py-2 text-xs font-bold transition-all',
                filter === 'all'
                  ? 'border-transparent bg-[var(--accent)] text-black shadow-sm'
                  : 'border-transparent bg-transparent text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={cn(
                'rounded-2xl border px-4 py-2 text-xs font-bold transition-all',
                filter === 'active'
                  ? 'border-transparent bg-[var(--accent)] text-black shadow-sm'
                  : 'border-transparent bg-transparent text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('paused')}
              className={cn(
                'rounded-2xl border px-4 py-2 text-xs font-bold transition-all',
                filter === 'paused'
                  ? 'border-transparent bg-[var(--accent)] text-black shadow-sm'
                  : 'border-transparent bg-transparent text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
              )}
            >
              Paused
            </button>

            <div className="ml-auto flex items-center gap-2 pr-1 text-xs text-[var(--foreground)]/45">
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{loading ? 'Refreshing listings' : 'Synced from your inventory'}</span>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="mt-7 rounded-[30px] border border-[var(--border-color)]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.14)] sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--border-color)]/70 bg-[var(--background)]/80 text-[var(--foreground)]/25 shadow-inner">
                <Package size={30} />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-[var(--foreground)]/80">
                No listings found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--foreground)]/48">
                {filter === 'all'
                  ? "You haven't listed any items for rent yet. Put your idle gear to work with a polished storefront."
                  : `No listings match the ${filter} filter right now.`}
              </p>
              <Link
                href={"/listings/new" as any}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl hyper-liquid px-5 py-3 text-sm font-bold shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5"
              >
                <Plus size={15} />
                {filter === 'all' ? 'Create your first listing' : 'List New Item'}
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <MyListingCard
                  key={listing.id}
                  listing={listing}
                  pendingRequestsCount={pendingCountsMap[listing.id] || 0}
                  isOutOnRental={!!outOnRentalMap[listing.id]}
                  onListingUpdated={patchListing}
                  onManageAvailability={(id, title) => setAvailabilityModal({ id, title })}
                  onDelete={(id, title) => setDeleteModal({ id, title })}
                />
              ))}
            </div>
          )}
        </div>

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
            ownerBookings={bookings}
            onClose={() => setDeleteModal(null)}
            onDeleted={() => {
              removeListing(deleteModal.id);
              setDeleteModal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
