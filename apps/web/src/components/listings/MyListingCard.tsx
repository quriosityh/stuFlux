'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApiClient } from '@/lib/api-client';
import {
  Package, Pencil, Eye, AlertCircle, Edit, MoreVertical, ChevronDown,
  Pause, Play, Calendar, Trash2, Check, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';
import {
  readApiError,
  updateListingDailyRate,
  updateListingStatus,
} from '@/lib/listings/api';
import type { OwnerListing } from '@/lib/listings/types';

interface MyListingCardProps {
  listing: OwnerListing;
  pendingRequestsCount: number;
  isOutOnRental: boolean;
  onListingUpdated: (listingId: string, patch: Partial<OwnerListing>) => void;
  onManageAvailability: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function MyListingCard({
  listing,
  pendingRequestsCount,
  isOutOnRental,
  onListingUpdated,
  onManageAvailability,
  onDelete,
}: MyListingCardProps) {
  const api = useApiClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [priceEditOpen, setPriceEditOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(Math.round(listing.daily_rate / 100).toString());
  const [savingPrice, setSavingPrice] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceEditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNewPrice(Math.round(listing.daily_rate / 100).toString());
  }, [listing.daily_rate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (priceEditRef.current && !priceEditRef.current.contains(event.target as Node)) {
        setPriceEditOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePriceSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = parseInt(newPrice, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setActionError('Enter a valid daily rate in PKR.');
      return;
    }

    setSavingPrice(true);
    setActionError(null);
    try {
      await updateListingDailyRate(api, listing.id, parsed * 100);
      setPriceEditOpen(false);
      onListingUpdated(listing.id, { daily_rate: parsed * 100 });
    } catch (err) {
      setActionError(await readApiError(err, 'Failed to update price. Please try again.'));
    } finally {
      setSavingPrice(false);
    }
  };

  const handleToggleStatus = async () => {
    if (isOutOnRental) return;
    setTogglingStatus(true);
    setDropdownOpen(false);
    setActionError(null);
    const nextStatus = listing.status === 'active' ? 'inactive' : 'active';
    try {
      await updateListingStatus(api, listing.id, nextStatus);
      onListingUpdated(listing.id, { status: nextStatus });
    } catch (err) {
      setActionError(await readApiError(err, 'Failed to update listing status.'));
    } finally {
      setTogglingStatus(false);
    }
  };

  const areaName = getAreaById(listing.area, LAHORE_AREAS_DATA)?.name ?? listing.area;
  const imageUrl = listing.photo?.thumbnail_url || listing.photo?.url;

  let statusBadge = null;
  if (isOutOnRental) {
    statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        Out on rental ●
      </span>
    );
  } else if (listing.status === 'active') {
    statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
        Live ●
      </span>
    );
  } else {
    statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--foreground)]/40 bg-[var(--foreground)]/5 px-2 py-0.5 rounded-full border border-[var(--border-color)]">
        Paused ●
      </span>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-[var(--border-color)]/70 bg-[var(--surface)]/82 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />

      <div className="p-4 sm:p-5 flex gap-4 items-start relative min-h-[126px]">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06))] flex-shrink-0 flex items-center justify-center text-[var(--foreground)]/30 border border-[var(--border-color)]/50 relative shadow-inner">
          {imageUrl ? (
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <Package size={28} />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-16">
          <h4 className="font-display font-bold text-[15px] text-[var(--foreground)] truncate leading-tight">
            {listing.title}
          </h4>

          <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-semibold text-[var(--foreground)]/52">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-[var(--border-color)]/60 bg-[var(--background)]/80 text-[10px] text-[var(--foreground)]/62 shadow-sm">
              {listing.category?.icon || <Package size={11} />}
            </span>
            <span className="truncate">{listing.category?.name || 'Item'}</span>
            <span className="text-[var(--foreground)]/35">·</span>
            <span className="truncate">{areaName}</span>
          </p>

          <div className="relative mt-2 flex items-center gap-1.5" ref={priceEditRef}>
            <button
              onClick={() => setPriceEditOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)]/50 bg-[var(--background)]/55 px-2.5 py-1.5 text-xs font-bold text-[var(--foreground)]/88 transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--foreground)]/4 hover:text-[var(--foreground)]"
            >
              <span>Rs {Math.round(listing.daily_rate / 100).toLocaleString()} / day</span>
              <Pencil size={11} className="opacity-60" />
            </button>

            {priceEditOpen && (
              <form
                onSubmit={handlePriceSave}
                className="absolute left-0 top-full mt-2 z-20 flex items-center gap-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-2.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-24 rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-2.5 py-2 text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="PKR"
                  min="1"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-40"
                >
                  {savingPrice ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                </button>
              </form>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)]/50 bg-[var(--background)]/45 px-2.5 py-1 text-[10px] font-semibold text-[var(--foreground)]/50">
              <Eye size={12} />
              {listing.view_count} views
            </span>

            {pendingRequestsCount > 0 && (
              <Link
                href={"/bookings" as any}
                className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold text-red-400 transition-all hover:bg-red-400/15"
              >
                <AlertCircle size={10} />
                {pendingRequestsCount} pending request{pendingRequestsCount > 1 ? 's' : ''}
              </Link>
            )}
          </div>

          {actionError && (
            <p className="mt-2 text-[10px] font-medium text-red-400">{actionError}</p>
          )}
        </div>

        <div className="absolute top-4 right-4">
          {statusBadge}
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-[var(--border-color)]/70 bg-[var(--background)]/35">
        <Link
          href={`/listings/${listing.id}/edit` as any}
          className="flex items-center justify-center gap-1.5 border-r border-[var(--border-color)]/70 py-3 text-center text-xs font-bold text-[var(--foreground)]/72 transition-all hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
        >
          <Edit size={13} />
          Edit Listing
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            disabled={togglingStatus}
            className="flex w-full items-center justify-center gap-1.5 py-3 text-center text-xs font-bold text-[var(--foreground)]/72 transition-all hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] disabled:opacity-60"
          >
            {togglingStatus ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <MoreVertical size={13} />
                Actions
                <ChevronDown size={12} className="opacity-60" />
              </>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-3 bottom-full z-30 mb-2 w-52 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={handleToggleStatus}
                disabled={isOutOnRental}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all hover:bg-[var(--foreground)]/5',
                  isOutOnRental ? 'opacity-40 cursor-not-allowed' : 'text-[var(--foreground)]/80 hover:text-[var(--foreground)]'
                )}
                title={isOutOnRental ? 'Cannot pause listing while item is out on rental' : undefined}
              >
                {listing.status === 'active' ? (
                  <>
                    <Pause size={14} className="text-[var(--foreground)]/50" />
                    Pause Listing
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-[var(--foreground)]/50" />
                    Resume Listing
                  </>
                )}
              </button>

              <button
                onClick={() => { setDropdownOpen(false); onManageAvailability(listing.id, listing.title); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[var(--foreground)]/80 transition-all hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
              >
                <Calendar size={14} className="text-[var(--foreground)]/50" />
                Manage Availability
              </button>

              <div className="my-1 border-t border-[var(--border-color)]/50" />

              <button
                onClick={() => { setDropdownOpen(false); onDelete(listing.id, listing.title); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-400 transition-all hover:bg-red-500/5"
              >
                <Trash2 size={14} />
                Delete Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
