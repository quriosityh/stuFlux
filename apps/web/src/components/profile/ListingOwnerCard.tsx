'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Edit3, Pause, Play, Trash2, Calendar, Eye,
  MoreHorizontal, Package, AlertTriangle, X,
} from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  daily_rate: number;
  area: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  view_count: number;
  created_at: string;
  category?: { name: string; icon?: string };
  photo?: { url?: string; thumbnail_url?: string } | null;
};

type Props = {
  listing: Listing;
  onStatusChange: (id: string, status: 'active' | 'inactive') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel }: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative chrome-card rounded-3xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'var(--surface)' }}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="font-display text-lg font-bold text-center text-[var(--foreground)] mb-2">
          Delete listing?
        </h3>
        <p className="text-sm text-[var(--foreground)]/50 text-center mb-6">
          <span className="font-semibold text-[var(--foreground)]/70">"{title}"</span>
          {' '}will be archived and removed from the marketplace. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export function ListingOwnerCard({ listing, onStatusChange, onDelete }: Props) {
  const [pending, setPending] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isActive = listing.status === 'active';
  const photo = listing.photo?.thumbnail_url || listing.photo?.url;

  const toggleStatus = async () => {
    setPending(true);
    await onStatusChange(listing.id, isActive ? 'inactive' : 'active');
    setPending(false);
  };

  const handleDelete = async () => {
    setShowDelete(false);
    await onDelete(listing.id);
  };

  return (
    <>
      {showDelete && (
        <DeleteModal
          title={listing.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      <div
        className="chrome-card rounded-2xl overflow-hidden animate-in fade-in duration-300"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[var(--border-color)]/30 flex-shrink-0 flex items-center justify-center">
            {photo ? (
              <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-[var(--foreground)]/20" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--foreground)] truncate leading-snug">
                  {listing.title}
                </p>
                {listing.category && (
                  <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                    {listing.category.icon} {listing.category.name}
                  </p>
                )}
              </div>

              {/* Status pill */}
              <span
                className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  isActive
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-[var(--foreground)]/8 text-[var(--foreground)]/40'
                }`}
              >
                {isActive ? 'Live' : 'Paused'}
              </span>
            </div>

            {/* Price + views */}
            <div className="flex items-center gap-3 mt-2">
              <span className="font-display font-bold text-base text-[var(--foreground)]">
                Rs {listing.daily_rate.toLocaleString()}
                <span className="text-xs font-normal text-[var(--foreground)]/40">/day</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--foreground)]/40">
                <Eye size={11} />
                {listing.view_count}
              </span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="border-t border-[var(--border-color)] px-4 py-3 flex items-center gap-2">
          {/* Edit */}
          <Link
            href={`/listings/${listing.id}/edit`}
            id={`edit-listing-${listing.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
          >
            <Edit3 size={13} />
            Edit
          </Link>

          {/* Availability shortcut → Step 6 */}
          <Link
            href={`/listings/${listing.id}/edit?step=6`}
            id={`availability-listing-${listing.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--accent)]/70 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all"
          >
            <Calendar size={13} />
            Availability
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Pause / Resume */}
          <button
            id={`toggle-listing-${listing.id}`}
            onClick={toggleStatus}
            disabled={pending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/8'
                : 'text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-400/8'
            } disabled:opacity-40`}
          >
            {isActive ? <Pause size={13} /> : <Play size={13} />}
            {isActive ? 'Pause' : 'Resume'}
          </button>

          {/* Delete */}
          <button
            id={`delete-listing-${listing.id}`}
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-400/8 transition-all"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
