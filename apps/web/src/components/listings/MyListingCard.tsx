'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApiClient } from '@/lib/api-client';
import { 
  Package, Pencil, Eye, AlertCircle, Edit, MoreVertical, 
  Pause, Play, Calendar, Trash2, Check, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';

interface ListingPhoto {
  url: string;
  thumbnail_url?: string;
  is_primary?: boolean;
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
  daily_rate: number; // in paisa
  area: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  view_count: number;
  category?: ListingCategory;
  photo?: ListingPhoto | null;
}

interface MyListingCardProps {
  listing: MyListing;
  pendingRequestsCount: number;
  isOutOnRental: boolean;
  onRefresh: () => void;
  onManageAvailability: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function MyListingCard({
  listing,
  pendingRequestsCount,
  isOutOnRental,
  onRefresh,
  onManageAvailability,
  onDelete,
}: MyListingCardProps) {
  const api = useApiClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [priceEditOpen, setPriceEditOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(Math.round(listing.daily_rate / 100).toString());
  const [savingPrice, setSavingPrice] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceEditRef = useRef<HTMLDivElement>(null);

  // Close dropdown and price edit on click outside
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
    if (isNaN(parsed) || parsed <= 0) return;

    setSavingPrice(true);
    try {
      await api.put(`listings/${listing.id}`, {
        json: {
          daily_rate: parsed * 100, // convert back to paisa
        },
      }).json();
      setPriceEditOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving price:', err);
    } finally {
      setSavingPrice(false);
    }
  };

  const handleToggleStatus = async () => {
    if (isOutOnRental) return;
    setTogglingStatus(true);
    setDropdownOpen(false);
    const nextStatus = listing.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`listings/${listing.id}`, {
        json: {
          status: nextStatus,
        },
      }).json();
      onRefresh();
    } catch (err) {
      console.error('Error toggling listing status:', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  const areaName = getAreaById(listing.area, LAHORE_AREAS_DATA)?.name ?? listing.area;
  const imageUrl = listing.photo?.thumbnail_url || listing.photo?.url;

  // Derive status presentation
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
    <div className="chrome-card rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border-color)]/70 flex flex-col transition-all hover:shadow-md duration-200">
      
      {/* 1. Symmetrical Sized Card Contents */}
      <div className="p-4 flex gap-4 items-start relative min-h-[120px]">
        {/* Square Thumbnail Photo */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[var(--background)] flex-shrink-0 flex items-center justify-center text-[var(--foreground)]/30 border border-[var(--border-color)]/50 relative">
          {imageUrl ? (
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <Package size={28} />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pr-16">
          <h4 className="font-display font-bold text-sm text-[var(--foreground)] truncate leading-tight">
            {listing.title}
          </h4>

          <p className="text-xs text-[var(--foreground)]/50 font-semibold truncate mt-1 flex items-center gap-1.5">
            <span>{listing.category?.name || 'Item'}</span>
            <span>·</span>
            <span>{areaName}</span>
          </p>

          {/* Interactive Price Display */}
          <div className="relative mt-1.5 flex items-center gap-1.5" ref={priceEditRef}>
            <button
              onClick={() => setPriceEditOpen(prev => !prev)}
              className="text-xs font-bold text-[var(--foreground)]/90 hover:text-[var(--accent)] flex items-center gap-1 transition-colors py-0.5 rounded-md px-1 -ml-1 hover:bg-[var(--foreground)]/5"
            >
              <span>{Math.round(listing.daily_rate / 100).toLocaleString()} Rs. / day</span>
              <Pencil size={11} className="opacity-60" />
            </button>

            {priceEditOpen && (
              <form 
                onSubmit={handlePriceSave}
                className="absolute left-0 top-full mt-1.5 z-20 bg-[var(--surface)] border border-[var(--border-color)] shadow-xl rounded-2xl p-2.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-20 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[var(--accent)] font-semibold"
                  placeholder="PKR"
                  min="1"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="w-8 h-8 rounded-lg bg-[var(--accent)] text-black flex items-center justify-center hover:opacity-90 disabled:opacity-40"
                >
                  {savingPrice ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                </button>
              </form>
            )}
          </div>

          {/* View Metrics & Pending Requests */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] text-[var(--foreground)]/40 font-semibold flex items-center gap-1">
              <Eye size={12} />
              {listing.view_count} views
            </span>

            {pendingRequestsCount > 0 && (
              <Link
                href={"/bookings" as any}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20 hover:bg-red-400/15 transition-all"
              >
                <AlertCircle size={10} />
                {pendingRequestsCount} pending request{pendingRequestsCount > 1 ? 's' : ''}
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Status Badge (Top-Right) */}
        <div className="absolute top-4 right-4">
          {statusBadge}
        </div>
      </div>

      {/* 2. 50/50 Action Bar (Divider + Two Equal Buttons) */}
      <div className="border-t border-[var(--border-color)]/70 flex grid grid-cols-2">
        <Link
          href={`/listings/${listing.id}/edit` as any}
          className="py-3 text-center text-xs font-bold text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all flex items-center justify-center gap-1.5 border-r border-[var(--border-color)]/70"
        >
          <Edit size={13} />
          Edit Listing
        </Link>

        {/* Actions Dropdown Wrapper */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            disabled={togglingStatus}
            className="w-full py-3 text-center text-xs font-bold text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all flex items-center justify-center gap-1.5"
          >
            {togglingStatus ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <MoreVertical size={13} />
                Actions ▾
              </>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-4 bottom-full mb-1 z-30 w-48 bg-[var(--surface)] border border-[var(--border-color)] shadow-xl rounded-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              
              <button
                onClick={handleToggleStatus}
                disabled={isOutOnRental}
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2 hover:bg-[var(--foreground)]/5",
                  isOutOnRental ? "opacity-40 cursor-not-allowed" : "text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                )}
                title={isOutOnRental ? "Cannot pause listing while item is out on rental" : undefined}
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
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all flex items-center gap-2"
              >
                <Calendar size={14} className="text-[var(--foreground)]/50" />
                Manage Availability
              </button>

              <div className="my-1 border-t border-[var(--border-color)]/50" />

              <button
                onClick={() => { setDropdownOpen(false); onDelete(listing.id, listing.title); }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-400 hover:bg-red-500/5 transition-all flex items-center gap-2"
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
