'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ArrowLeft,
  ChevronDown,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Package,
  Pencil,
  Pause,
  Play,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { AvailabilityCalendar } from '@/components/pdp/AvailabilityCalendar';
import { useApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';

type ListingStatus = 'draft' | 'active' | 'inactive' | 'archived';
type Filter = 'all' | 'active' | 'paused';
type BlockedRange = { start_date: string; end_date: string };

type Listing = {
  id: string;
  title: string;
  daily_rate: number;
  area: string;
  status: ListingStatus;
  view_count: number;
  booking_count?: number;
  rating?: number | null;
  review_count?: number;
  delivery_available?: boolean;
  category?: { name?: string; icon?: string } | null;
  photo?: { url?: string | null; thumbnail_url?: string | null } | null;
};

type Booking = {
  listing_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  start_date: string;
  end_date: string;
};

const currency = new Intl.NumberFormat('en-PK');

// Temporary visual-preview inventory. It is automatically replaced the moment
// the owner's API returns a listing.
const previewListings: Listing[] = [
  {
    id: 'preview-camera-kit',
    title: 'Canon EOS Camera Kit',
    daily_rate: 250000,
    area: 'Gulberg',
    status: 'active',
    view_count: 128,
    booking_count: 8,
    rating: 4.9,
    review_count: 12,
    delivery_available: true,
    category: { name: 'Cameras & Creators', icon: '📷' },
    photo: { url: '/images/categories/camera1.jpeg' },
  },
  {
    id: 'preview-drill',
    title: 'Bosch Professional Drill Set',
    daily_rate: 120000,
    area: 'Johar Town',
    status: 'inactive',
    view_count: 46,
    booking_count: 3,
    rating: 4.7,
    review_count: 5,
    delivery_available: false,
    category: { name: 'Tools & Home Fix', icon: '🔧' },
    photo: { url: '/images/categories/tools.png' },
  },
];

const previewBookings: Booking[] = [
  {
    listing_id: 'preview-camera-kit',
    status: 'pending',
    start_date: '2026-08-12',
    end_date: '2026-08-14',
  },
];

function toRupees(value: number) {
  return currency.format(value >= 1000 ? Math.round(value / 100) : value);
}

function isOutOnRental(listingId: string, bookings: Booking[]) {
  const today = new Date().toISOString().slice(0, 10);
  return bookings.some(
    (booking) =>
      booking.listing_id === listingId &&
      booking.status === 'confirmed' &&
      booking.start_date <= today &&
      booking.end_date >= today,
  );
}

function ListingCover({ listing }: { listing: Listing }) {
  const source = listing.photo?.thumbnail_url || listing.photo?.url;
  if (!source) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--tag-bg)] text-[var(--tag-fg)]">
        <Package size={34} strokeWidth={1.5} />
      </div>
    );
  }
  // Listing images originate from user-configurable CDN URLs, so a native image
  // keeps this card compatible without expanding the global Next image allow-list.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={source} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />;
}

export function OwnerListingsClient() {
  const api = useApiClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [previewInventory, setPreviewInventory] = useState<Listing[]>(previewListings);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [priceListing, setPriceListing] = useState<Listing | null>(null);
  const [price, setPrice] = useState('');
  const [availabilityListing, setAvailabilityListing] = useState<Listing | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedRange[]>([]);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [deleteListing, setDeleteListing] = useState<Listing | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listingResponse, bookingResponse] = await Promise.all([
        api.get('listings/owner/my', { searchParams: { limit: '50' } }).json<{ data: Listing[] }>(),
        api.get('bookings', { searchParams: { role: 'owner', limit: '200' } }).json<{ data: Booking[] }>(),
      ]);
      setListings(listingResponse.data ?? []);
      setBookings(bookingResponse.data ?? []);
    } catch {
      setError('We couldn’t load your listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  const isPreviewMode = listings.length === 0 && previewInventory.length > 0;
  const displayedListings = isPreviewMode ? previewInventory : listings;
  const displayedBookings = isPreviewMode ? previewBookings : bookings;

  const visibleListings = useMemo(() => displayedListings.filter((listing) => {
    if (filter === 'active') return listing.status === 'active';
    if (filter === 'paused') return listing.status === 'inactive';
    return listing.status !== 'archived';
  }), [displayedListings, filter]);

  const pendingCount = useCallback((id: string) => displayedBookings.filter((booking) => booking.listing_id === id && booking.status === 'pending').length, [displayedBookings]);

  const updateListing = async (listing: Listing, patch: Partial<Listing>, successMessage: string) => {
    if (listing.id.startsWith('preview-')) {
      setPreviewInventory((current) => current.map((item) => item.id === listing.id ? { ...item, ...patch } : item));
      setSuccess(successMessage);
      return true;
    }
    setIsSaving(true);
    try {
      const response = await api.put(`listings/${listing.id}`, { json: patch }).json<{ data: Listing }>();
      setListings((current) => current.map((item) => item.id === listing.id ? { ...item, ...response.data } : item));
      setSuccess(successMessage);
      return true;
    } catch {
      setError('That change could not be saved. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const openAvailability = async (listing: Listing) => {
    setOpenMenu(null);
    setAvailabilityListing(listing);
    setSelectedDates({ start: null, end: null });
    if (listing.id.startsWith('preview-')) {
      setBlockedDates([]);
      return;
    }
    try {
      const response = await api.get(`listings/${listing.id}/blocked-dates`).json<{ data: BlockedRange[] }>();
      setBlockedDates(response.data ?? []);
    } catch {
      setBlockedDates([]);
      setError('Blocked dates could not be loaded. Please try again.');
    }
  };

  const saveAvailability = async () => {
    if (!availabilityListing) return;
    if (availabilityListing.id.startsWith('preview-')) {
      setAvailabilityListing(null);
      setSuccess('Availability updated.');
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`listings/${availabilityListing.id}/blocked-dates`, { json: { blocked_dates: blockedDates } });
      setAvailabilityListing(null);
      setSuccess('Availability updated.');
    } catch {
      setError('Availability could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateSelection = (dates: { start: Date | null; end: Date | null }) => {
    if (!dates.start || !dates.end) {
      setSelectedDates(dates);
      return;
    }
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    setBlockedDates((current) => [...current, { start_date: formatDate(dates.start!), end_date: formatDate(dates.end!) }]);
    setSelectedDates({ start: null, end: null });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-5 text-[var(--foreground)] md:pt-20 lg:pb-10">
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6">
        <header className="chrome-card relative mb-5 overflow-hidden rounded-[1.65rem] p-5 sm:mb-6 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-[var(--tag-bg)] blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--tag-bg)] px-2 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-[var(--tag-fg)] uppercase">
                <Link href={{ pathname: '/' }} className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]" title="Back to explore">
                  <ArrowLeft size={13} /> Explore
                </Link>
                <span className="h-3 w-px bg-[var(--border-color)]" />
                <span className="inline-flex items-center gap-1.5 pr-1.5"><Sparkles size={13} /> Your storefront</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-[42px]">Your listings</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">Keep your gear discoverable, available, and priced for the next rental.</p>
            </div>
            <Link href={{ pathname: '/listings/new' }} className="hyper-liquid h-12 px-5 text-sm sm:self-auto">
              <Plus size={18} strokeWidth={2.5} /> List new item
            </Link>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-1 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-1.5 sm:w-fit">
          {(['all', 'active', 'paused'] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold capitalize transition-all sm:flex-none ${filter === item ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--tag-bg)] hover:text-[var(--foreground)]'}`}>
              {item}
            </button>
          ))}
          </div>
          {!isLoading && <p className="px-1 text-xs font-semibold text-[var(--text-subtle)]">{visibleListings.length} {visibleListings.length === 1 ? 'item' : 'items'} shown</p>}
        </div>

        {error && !isPreviewMode && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--tag-bg)] px-4 py-3 text-sm text-[var(--foreground)]">
            <span>{error}</span><button onClick={() => { setError(null); void load(); }} className="font-bold text-[var(--tag-fg)]">Retry</button>
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--tag-bg)] px-4 py-3 text-sm font-semibold text-[var(--tag-fg)]">
            <span>{success}</span><button onClick={() => setSuccess(null)} className="rounded-full p-0.5 hover:bg-[var(--surface)]" aria-label="Dismiss confirmation"><X size={15} /></button>
          </div>
        )}

        {isLoading ? <LoadingState /> : visibleListings.length === 0 ? <EmptyState filter={filter} /> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {visibleListings.map((listing) => {
              const isOut = isOutOnRental(listing.id, displayedBookings);
              const isPaused = listing.status === 'inactive';
              const pending = pendingCount(listing.id);
              const hasActiveOrUpcomingBooking = displayedBookings.some((booking) =>
                booking.listing_id === listing.id &&
                booking.status === 'confirmed' &&
                booking.end_date >= new Date().toISOString().slice(0, 10),
              );
              return (
                <article key={listing.id} className="chrome-card group overflow-visible rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_44px_var(--shadow-ambient)]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-[0.95rem] bg-[var(--tag-bg)]">
                    <ListingCover listing={listing} />
                    <div className="absolute left-3 top-3"><StatusBadge paused={isPaused} out={isOut} /></div>
                    <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-[var(--border-color)] bg-[var(--sheet-bg)] px-2.5 py-1 text-[11px] font-bold text-[var(--foreground)] shadow-sm">
                      {listing.category?.icon || '◈'} {listing.category?.name || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="space-y-2 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 truncate text-[15px] font-extrabold tracking-[-0.015em] sm:text-base">{listing.title}</h2>
                      {listing.rating != null ? <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-[var(--accent)]"><Star size={13} className="fill-[var(--accent)]" /> {Number(listing.rating).toFixed(1)}</span> : <span className="shrink-0 rounded-full bg-[var(--tag-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--tag-fg)]">New</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs font-medium text-[var(--text-muted)]"><span className="truncate">📍 {listing.area}</span>{listing.delivery_available && <span className="inline-flex shrink-0 items-center gap-1"><Truck size={13} /> Delivery</span>}</div>
                    <div className="flex items-center justify-between gap-3 border-t border-[var(--border-color)] pt-2.5">
                      <button onClick={() => { setPriceListing(listing); setPrice(String(Math.round(listing.daily_rate >= 1000 ? listing.daily_rate / 100 : listing.daily_rate))); }} className="inline-flex items-center gap-1 rounded-lg text-sm font-extrabold transition-colors hover:text-[var(--accent)]">
                        Rs. {toRupees(listing.daily_rate)} <span className="text-[11px] font-medium text-[var(--text-muted)]">/ day</span><Pencil size={13} className="text-[var(--accent)]" />
                      </button>
                      <span className="shrink-0 text-[11px] font-semibold text-[var(--text-muted)]">{listing.booking_count ?? 0} rentals</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-[var(--text-muted)]"><span className="inline-flex items-center gap-1"><Eye size={13} /> {listing.view_count ?? 0} views</span>{pending > 0 && <Link href={{ pathname: '/bookings', query: { tab: 'rentingOut' } }} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--tag-bg)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--tag-fg)] transition-opacity hover:opacity-75"><span className="size-1.5 rounded-full bg-[var(--accent)]" />{pending} pending</Link>}</div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-[var(--border-color)]">
                    <Link href={{ pathname: `/listings/${listing.id}/edit` }} className="flex min-h-11 items-center justify-center gap-1.5 border-r border-[var(--border-color)] bg-[var(--tag-bg)] text-[13px] font-bold text-[var(--tag-fg)] transition-colors hover:brightness-95"><Pencil size={15} /> Edit</Link>
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)} className="flex min-h-11 w-full items-center justify-center gap-1.5 text-[13px] font-bold transition-colors hover:bg-[var(--tag-bg)]"><MoreHorizontal size={16} /> Actions <ChevronDown size={13} className={openMenu === listing.id ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
                      {openMenu === listing.id && <ActionsMenu listing={listing} isOut={isOut} onClose={() => setOpenMenu(null)} onAvailability={() => void openAvailability(listing)} onStatus={() => void updateListing(listing, { status: isPaused ? 'active' : 'inactive' }, isPaused ? 'Listing is live again.' : 'Listing paused.')} onDelete={() => { setOpenMenu(null); if (hasActiveOrUpcomingBooking) { setError('Cannot delete item with active or upcoming bookings.'); return; } setDeleteListing(listing); }} />}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {priceListing && <Modal title="Update daily rate" onClose={() => setPriceListing(null)}><p className="mb-4 text-sm text-[var(--text-muted)]">Set the daily price for <strong className="text-[var(--foreground)]">{priceListing.title}</strong>.</p><label className="text-sm font-bold">Daily rate (Rs.)<input autoFocus inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-transparent px-3 py-3 text-base outline-none focus:border-[var(--accent)]" /></label><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setPriceListing(null)}>Cancel</Button><Button variant="liquid" disabled={isSaving || !price} onClick={async () => { if (await updateListing(priceListing, { daily_rate: Number(price) * 100 }, 'Daily rate updated.')) setPriceListing(null); }}>{isSaving ? 'Saving…' : 'Save rate'}</Button></div></Modal>}

      {availabilityListing && <Modal title="Manage availability" onClose={() => setAvailabilityListing(null)} wide><p className="mb-1 text-sm text-[var(--text-muted)]">Select a range to block it. Tap an existing blocked date to remove its range.</p><AvailabilityCalendar mode="owner" blockedDates={blockedDates} selectedDates={selectedDates} onSelectDates={handleDateSelection} onUnblockRange={(range) => setBlockedDates((current) => current.filter((item) => item.start_date !== range.start_date || item.end_date !== range.end_date))} monthsToShow={2} /><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setAvailabilityListing(null)}>Cancel</Button><Button variant="liquid" disabled={isSaving} onClick={() => void saveAvailability()}>{isSaving ? 'Saving…' : 'Save availability'}</Button></div></Modal>}

      {deleteListing && <Modal title="Delete listing?" onClose={() => setDeleteListing(null)}><p className="text-sm leading-6 text-[var(--text-muted)]"><strong className="text-[var(--foreground)]">‘{deleteListing.title}’</strong> will be archived and removed from the marketplace. This cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setDeleteListing(null)}>Cancel</Button><button disabled={isSaving} onClick={async () => { if (await updateListing(deleteListing, { status: 'archived' }, 'Listing archived.')) setDeleteListing(null); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 text-sm font-bold text-[var(--background)] disabled:opacity-50"><Trash2 size={15} />{isSaving ? 'Deleting…' : 'Delete listing'}</button></div></Modal>}
    </main>
  );
}

function StatusBadge({ paused, out }: { paused: boolean; out: boolean }) {
  const label = out ? 'Out on rental' : paused ? 'Paused' : 'Live';
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-color)] px-2.5 py-1 text-[11px] font-extrabold ${paused ? 'text-[var(--text-muted)]' : 'bg-[var(--tag-bg)] text-[var(--tag-fg)]'}`}><span className={`size-1.5 rounded-full ${paused ? 'bg-[var(--text-subtle)]' : 'bg-[var(--accent)]'}`} />{label}</span>;
}

function ActionsMenu({ listing, isOut, onClose, onAvailability, onStatus, onDelete }: { listing: Listing; isOut: boolean; onClose: () => void; onAvailability: () => void; onStatus: () => void; onDelete: () => void }) {
  const isPaused = listing.status === 'inactive';
  return <div className="absolute right-2 bottom-[calc(100%+0.5rem)] z-20 w-56 rounded-2xl border border-[var(--border-color)] bg-[var(--sheet-bg)] p-1.5 shadow-[0_12px_32px_var(--shadow-color)]"><button disabled={isOut} title={isOut ? 'Unavailable while this item is out on rental' : undefined} onClick={() => { onClose(); onStatus(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-[var(--tag-bg)] disabled:cursor-not-allowed disabled:opacity-40">{isPaused ? <Play size={16} /> : <Pause size={16} />}{isPaused ? 'Resume listing' : 'Pause listing'}</button><button onClick={onAvailability} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-[var(--tag-bg)]"><CalendarDays size={16} />Manage availability</button><div className="my-1 border-t border-[var(--border-color)]" /><button onClick={onDelete} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-[var(--tag-bg)]"><Trash2 size={16} />Delete listing</button></div>;
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[color-mix(in_srgb,var(--foreground)_28%,transparent)] p-3 backdrop-blur-sm sm:items-center"><section role="dialog" aria-modal="true" aria-label={title} className={`w-full rounded-3xl border border-[var(--border-color)] bg-[var(--sheet-bg)] p-5 shadow-[0_24px_60px_var(--shadow-color)] sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-xl font-bold">{title}</h2><button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--tag-bg)]" aria-label="Close"><X size={18} /></button></div>{children}</section></div>;
}

function LoadingState() { return <div className="chrome-card flex min-h-72 flex-col items-center justify-center rounded-[1.65rem]"><div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--tag-bg)]"><LoaderCircle className="animate-spin text-[var(--accent)]" /></div><span className="mt-4 text-sm font-semibold text-[var(--text-muted)]">Loading your inventory…</span></div>; }
function EmptyState({ filter }: { filter: Filter }) { return <div className="chrome-card flex min-h-72 flex-col items-center justify-center rounded-[1.65rem] px-6 text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--tag-bg)] text-[var(--tag-fg)]"><Package size={26} /></div><h2 className="font-display text-xl font-bold">{filter === 'all' ? 'Your storefront is ready' : `No ${filter} listings`}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">{filter === 'all' ? 'List an item to start building your rental inventory.' : 'Try another filter or create a new item for your storefront.'}</p>{filter === 'all' && <Link href={{ pathname: '/listings/new' }} className="hyper-liquid mt-5 h-10 px-4 text-sm"><Plus size={16} /> List new item</Link>}</div>; }
