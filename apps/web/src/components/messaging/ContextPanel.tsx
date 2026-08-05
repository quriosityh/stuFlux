import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from './types';
import { ContextListingCard } from './ContextListingCard';
import { ContextBookingDetails } from './ContextBookingDetails';
import { ContextActions } from './ContextActions';
import Link from 'next/link';

interface UserPublicProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  stats?: {
    completed_lent: number;
    completed_borrowed: number;
    lender_rating_avg: number | null;
    lender_rating_count: number;
    renter_rating_avg: number | null;
    renter_rating_count: number;
  };
}

export function ContextPanel({ conversation, isMobileSheet }: { conversation: Conversation; isMobileSheet?: boolean }) {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/proxy/users/${conversation.otherUserId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const payload = await res.json();
        const data = payload.data || payload;
        if (!cancelled && data) {
          setProfile(data);
        }
      } catch {
        // Fallback silently if public profile fetch fails
      }
    }
    if (conversation.otherUserId) {
      loadProfile();
    }
    return () => { cancelled = true; };
  }, [conversation.otherUserId, getToken]);

  const isLender = conversation.role === 'renter'; // The counterpart is lender if viewer is renter
  const ratingAvg = isLender
    ? profile?.stats?.lender_rating_avg
    : profile?.stats?.renter_rating_avg;
  const rentalsCount = isLender
    ? profile?.stats?.completed_lent
    : profile?.stats?.completed_borrowed;

  const avatar = conversation.otherUserAvatar || profile?.avatar_url;

  return (
    <div className={`flex flex-col h-full overflow-y-auto scrollbar-hide ${isMobileSheet ? 'p-4' : 'py-5 px-5'} bg-[var(--surface)]`}>
      <div className="flex flex-col gap-6 pt-1">
        <ContextListingCard conversation={conversation} />
        <ContextBookingDetails conversation={conversation} />
        <ContextActions conversation={conversation} />
        
        {/* Other User Info */}
        <div className="flex flex-col gap-2">
          <h3 className="font-syne font-bold text-[10px] text-[var(--foreground)] opacity-60 uppercase tracking-wider">
            {isLender ? 'Lender' : 'Renter'}
          </h3>
          <div className="flex items-center justify-between chrome-card p-3.5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-[var(--border-color)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt={conversation.otherUserName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{conversation.otherUserName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--foreground)]">{conversation.otherUserName}</div>
                <div className="text-xs opacity-65 mt-0.5">
                  {ratingAvg != null ? `★ ${ratingAvg.toFixed(1)}` : 'New Member'}
                  {rentalsCount != null ? ` · ${rentalsCount} rental${rentalsCount === 1 ? '' : 's'}` : ''}
                </div>
              </div>
            </div>
            <Link
              href={`/users/${conversation.otherUserId}` as any}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex-shrink-0"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

