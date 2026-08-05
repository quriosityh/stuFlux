'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronDown,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Package,
  Pencil,
  Pause,
  Play,
  Plus,
  Trash2,
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

function ListingImage({ listing }: { listing: Listing }) {
  const source = listing.photo?.thumbnail_url || listing.photo?.url;
  if (!source) {
    return (
      <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--tag-bg)] text-[var(--tag-fg)]">
        <Package size={27} strokeWidth={1.7} />
      </div>
    );
  }
  // Listing images originate from user-configurable CDN URLs, so a native image
  // keeps this card compatible without expanding the global Next image allow-list.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={source} alt="" className="size-20 shrink-0 rounded-2xl border border-[var(--border-color)] object-cover" />;
}

export function OwnerListingsClient() {
  const api = useApiClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const visibleListings = useMemo(() => listings.filter((listing) => {
    if (filter === 'active') return listing.status === 'active';
    if (filter === 'paused') return listing.status === 'inactive';
    return listing.status !== 'archived';
  }), [filter, listings]);

  const pendingCount = useCallback((id: string) => bookings.filter((booking) => booking.listing_id === id && booking.status === 'pending').length, [bookings]);

  const updateListing = async (listing: Listing, patch: Partial<Listing>) => {
    setIsSaving(true);
    try {
      const response = await api.put(`listings/${listing.id}`, { json: patch }).json<{ data: Listing }>();
      setListings((current) => current.map((item) => item.id === listing.id ? { ...item, ...response.data } : item));
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
    setIsSaving(true);
    try {
      await api.put(`listings/${availabilityListing.id}/blocked-dates`, { json: { blocked_dates: blockedDates } });
      setAvailabilityListing(null);
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
      <div className="mx-auto w-full max-w-[860px] px-4 sm:px-6">
        <header className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[var(--text-subtle)] uppercase">Your warehouse</p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Listings</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Manage your inventory, availability, and pricing.</p>
          </div>
          <Link href={{ pathname: '/listings/new' }} className="hyper-liquid h-11 px-4 text-sm sm:self-auto">
            <Plus size={18} strokeWidth={2.5} /> List new item
          </Link>
        </header>

        <div className="mb-6 flex w-full gap-1 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-1.5 sm:w-fit">
          {(['all', 'active', 'paused'] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition-all ${filter === item ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--tag-bg)] hover:text-[var(--foreground)]'}`}>
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--tag-bg)] px-4 py-3 text-sm text-[var(--foreground)]">
            <span>{error}</span><button onClick={() => { setError(null); void load(); }} className="font-bold text-[var(--tag-fg)]">Retry</button>
          </div>
        )}

        {isLoading ? <LoadingState /> : visibleListings.length === 0 ? <EmptyState filter={filter} /> : (
          <div className="space-y-4">
            {visibleListings.map((listing) => {
              const isOut = isOutOnRental(listing.id, bookings);
              const isPaused = listing.status === 'inactive';
              const pending = pendingCount(listing.id);
              const hasActiveOrUpcomingBooking = bookings.some((booking) =>
                booking.listing_id === listing.id &&
                booking.status === 'confirmed' &&
                booking.end_date >= new Date().toISOString().slice(0, 10),
              );
              return (
                <article key={listing.id} className="chrome-card overflow-visible rounded-3xl transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex gap-3 p-4 sm:gap-5 sm:p-5">
                    <ListingImage listing={listing} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate pr-1 text-base font-extrabold sm:text-lg">{listing.title}</h2>
                        <StatusBadge paused={isPaused} out={isOut} />
                      </div>
                      <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{listing.category?.icon || '◈'} {listing.category?.name || 'Uncategorized'} <span className="mx-1 text-[var(--text-subtle)]">·</span>{listing.area}</p>
                      <button onClick={() => { setPriceListing(listing); setPrice(String(Math.round(listing.daily_rate >= 1000 ? listing.daily_rate / 100 : listing.daily_rate))); }} className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-extrabold transition-colors hover:text-[var(--accent)]">
                        Rs. {toRupees(listing.daily_rate)} <span className="font-medium text-[var(--text-muted)]">/ day</span><Pencil size={14} className="text-[var(--accent)]" />
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1"><Eye size={14} /> {listing.view_count ?? 0} views</span>
                        {pending > 0 && <Link href={{ pathname: '/bookings', query: { tab: 'rentingOut' } }} className="inline-flex items-center gap-1 rounded-full bg-[var(--tag-bg)] px-2.5 py-1 text-[var(--tag-fg)] transition-opacity hover:opacity-75"><span className="size-1.5 rounded-full bg-[var(--accent)]" />{pending} pending {pending === 1 ? 'request' : 'requests'}</Link>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-[var(--border-color)]">
                    <Link href={{ pathname: `/listings/${listing.id}/edit` }} className="flex min-h-12 items-center justify-center gap-2 border-r border-[var(--border-color)] text-sm font-bold transition-colors hover:bg-[var(--tag-bg)]"><Pencil size={16} /> Edit listing</Link>
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)} className="flex min-h-12 w-full items-center justify-center gap-2 text-sm font-bold transition-colors hover:bg-[var(--tag-bg)]"><MoreHorizontal size={17} /> Actions <ChevronDown size={14} /></button>
                      {openMenu === listing.id && <ActionsMenu listing={listing} isOut={isOut} onClose={() => setOpenMenu(null)} onAvailability={() => void openAvailability(listing)} onStatus={() => void updateListing(listing, { status: isPaused ? 'active' : 'inactive' })} onDelete={() => { setOpenMenu(null); if (hasActiveOrUpcomingBooking) { setError('Cannot delete item with active or upcoming bookings.'); return; } setDeleteListing(listing); }} />}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {priceListing && <Modal title="Update daily rate" onClose={() => setPriceListing(null)}><p className="mb-4 text-sm text-[var(--text-muted)]">Set the daily price for <strong className="text-[var(--foreground)]">{priceListing.title}</strong>.</p><label className="text-sm font-bold">Daily rate (Rs.)<input autoFocus inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-transparent px-3 py-3 text-base outline-none focus:border-[var(--accent)]" /></label><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setPriceListing(null)}>Cancel</Button><Button variant="liquid" disabled={isSaving || !price} onClick={async () => { if (await updateListing(priceListing, { daily_rate: Number(price) * 100 })) setPriceListing(null); }}>{isSaving ? 'Saving…' : 'Save rate'}</Button></div></Modal>}

      {availabilityListing && <Modal title="Manage availability" onClose={() => setAvailabilityListing(null)} wide><p className="mb-1 text-sm text-[var(--text-muted)]">Select a range to block it. Tap an existing blocked date to remove its range.</p><AvailabilityCalendar mode="owner" blockedDates={blockedDates} selectedDates={selectedDates} onSelectDates={handleDateSelection} onUnblockRange={(range) => setBlockedDates((current) => current.filter((item) => item.start_date !== range.start_date || item.end_date !== range.end_date))} monthsToShow={2} /><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setAvailabilityListing(null)}>Cancel</Button><Button variant="liquid" disabled={isSaving} onClick={() => void saveAvailability()}>{isSaving ? 'Saving…' : 'Save availability'}</Button></div></Modal>}

      {deleteListing && <Modal title="Delete listing?" onClose={() => setDeleteListing(null)}><p className="text-sm leading-6 text-[var(--text-muted)]"><strong className="text-[var(--foreground)]">‘{deleteListing.title}’</strong> will be archived and removed from the marketplace. This cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setDeleteListing(null)}>Cancel</Button><button disabled={isSaving} onClick={async () => { if (await updateListing(deleteListing, { status: 'archived' })) setDeleteListing(null); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 text-sm font-bold text-[var(--background)] disabled:opacity-50"><Trash2 size={15} />{isSaving ? 'Deleting…' : 'Delete listing'}</button></div></Modal>}
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

function LoadingState() { return <div className="flex min-h-72 items-center justify-center"><LoaderCircle className="animate-spin text-[var(--accent)]" /><span className="ml-3 text-sm text-[var(--text-muted)]">Loading your inventory…</span></div>; }
function EmptyState({ filter }: { filter: Filter }) { return <div className="chrome-card flex min-h-72 flex-col items-center justify-center rounded-3xl px-6 text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--tag-bg)] text-[var(--tag-fg)]"><Package size={26} /></div><h2 className="font-display text-xl font-bold">{filter === 'all' ? 'Your storefront is ready' : `No ${filter} listings`}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">{filter === 'all' ? 'List an item to start building your rental inventory.' : 'Try another filter or create a new item for your storefront.'}</p>{filter === 'all' && <Link href={{ pathname: '/listings/new' }} className="hyper-liquid mt-5 h-10 px-4 text-sm"><Plus size={16} /> List new item</Link>}</div>; }
