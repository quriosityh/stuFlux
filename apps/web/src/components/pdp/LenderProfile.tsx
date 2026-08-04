'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, MapPin, CalendarDays, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';

interface LenderProfileProps {
  owner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    area?: string | null;
    city?: string | null;
    created_at?: string | null;
  };
  listingId: string;
}

interface UserPublicProfile {
  id: string;
  display_name: string;
  area: string;
  avatar_url: string | null;
  phone_verified: boolean;
  created_at: string;
  stats: {
    completed_lent: number;
    completed_borrowed: number;
    lender_rating_avg: number | null;
    lender_rating_count: number;
    renter_rating_avg: number | null;
    renter_rating_count: number;
  };
}

/** Format an area ID slug (e.g. "johar-town") into a readable label. */
function formatArea(area: string): string {
  return area
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function LenderProfile({ owner, listingId }: LenderProfileProps) {
  const api = useApiClient();
  const { isSignedIn } = useAuth();
  
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get(`users/${owner.id}`).json<{ success: boolean; data: UserPublicProfile }>();
        // Check if response is successful or wrapped directly in data
        const profileData = (res as any).data || res;
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to fetch lender public profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [owner.id, api]);

  const handleMessageLender = async () => {
    if (!isSignedIn) {
      window.location.href = '/auth/sign-in';
      return;
    }

    setMessaging(true);
    setMessageError(null);

    try {
      const res = await api
        .post('messages', {
          json: {
            listing_id: listingId,
            body: 'Hi! I am interested in renting your listing.',
          },
        })
        .json<{ success: boolean; data?: { conversation?: { id: string }; id?: string } }>();

      // API might return data nested differently
      const conversationId = 
        (res as any).data?.conversation?.id || 
        (res as any).data?.id || 
        (res as any).conversation?.id;

      if (conversationId) {
        window.location.href = `/messages/${conversationId}`;
      } else {
        // Fallback to general messages page if ID is missing
        window.location.href = '/messages';
      }
    } catch (err: any) {
      console.error('Failed to initiate conversation:', err);
      const payload = err?.response
        ? await err.response.json().catch(() => null)
        : null;
      setMessageError(
        payload?.error?.message ?? payload?.message ?? 'Failed to start conversation. Please try again.'
      );
      setMessaging(false);
    }
  };

  const nameParts = owner.display_name.split(' ');
  const firstName = nameParts[0] || 'Lender';
  const locationLabel = owner.area ? formatArea(owner.area) : owner.city || 'Lahore';

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="py-16 px-4 md:px-0 border-t border-border/10 animate-pulse" id="lender-section">
        <div className="h-8 w-48 rounded bg-border/15 mb-10" />
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-auto shrink-0">
            <div className="chrome-card rounded-3xl p-8 w-[320px] sm:w-[400px] h-52 bg-border/5" />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="h-8 w-64 rounded bg-border/15" />
            <div className="h-4 w-32 rounded bg-border/10" />
            <div className="h-16 w-full rounded bg-border/10" />
            <div className="h-10 w-40 rounded bg-border/15" />
          </div>
        </div>
      </div>
    );
  }

  const stats = profile?.stats;
  const ratingAvg = stats?.lender_rating_avg ?? null;
  const ratingCount = stats?.lender_rating_count ?? 0;
  const completedLent = stats?.completed_lent ?? 0;

  return (
    <div className="py-16 px-4 md:px-0 border-t border-border/10" id="lender-section">
      <h2 className="text-3xl font-bold font-syne mb-10 tracking-tight text-foreground">Meet your lender</h2>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* ===== LEFT COLUMN: Lender Card ===== */}
        <div className="w-full lg:w-auto shrink-0">
          <div className="chrome-card rounded-3xl p-5 sm:p-8 flex flex-row flex-nowrap items-center gap-5 sm:gap-8 relative overflow-hidden group">
            
            {/* Subtle glow effect */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Left side of card: Avatar & Name */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 shrink-0 w-[140px] sm:w-44">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-surface shadow-lg">
                <img 
                  src={owner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.display_name)}&background=random`} 
                  alt={owner.display_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-syne truncate max-w-[130px] sm:max-w-none text-foreground">
                  {owner.display_name}
                </h3>
                <p className="text-[10px] text-foreground/60 font-semibold uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" /> Verified Student
                </p>
              </div>
            </div>

            {/* Right side of card: Stats */}
            <div className="flex flex-col justify-center flex-1 min-w-0 border-l border-border/10 pl-5 sm:pl-8 gap-4 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none flex items-baseline gap-1 text-foreground">
                  {ratingAvg !== null ? (
                    <>
                      {ratingAvg.toFixed(1)}
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    </>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Rating</div>
              </div>
              <div className="w-full h-px bg-border/10" />
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none text-foreground">
                  {ratingCount}
                </div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Reviews Received</div>
              </div>
              <div className="w-full h-px bg-border/10" />
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none text-foreground">
                  {completedLent}
                </div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Rentals Completed</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ===== RIGHT COLUMN: Name, Bio, Reviews, and Actions ===== */}
        <div className="w-full lg:flex-1 space-y-6">
          <div>
            <h3 className="text-3xl sm:text-4xl font-bold font-syne text-foreground mb-2">
              {owner.display_name}
            </h3>
            <p className="text-sm font-medium text-foreground/60">
              Active Lender in {locationLabel}
            </p>
          </div>

          <div className="text-foreground/80 leading-relaxed font-medium space-y-6 max-w-2xl">
            <p className="text-sm sm:text-base">
              Hi, I'm {firstName}! I'm a student based in {locationLabel} and I love sharing my gear with other students on campus. 
              Always happy to answer questions and make your rental experience as smooth as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 text-sm">
              <div className="flex items-center gap-2 text-foreground/75">
                <MapPin className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>Lives in {locationLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/75">
                <CalendarDays className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>
                  Joined{' '}
                  {owner.created_at
                    ? formatDistanceToNow(new Date(owner.created_at), { addSuffix: true })
                    : '6 months ago'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            {messageError && (
              <p className="text-xs text-red-500 bg-red-500/8 border border-red-500/20 px-3 py-2 rounded-xl max-w-xs">
                {messageError}
              </p>
            )}
            <button
              onClick={handleMessageLender}
              disabled={messaging}
              className="w-full sm:w-auto hyper-liquid px-8 py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {messaging ? (
                <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin shrink-0" />
              ) : (
                <MessageCircle className="w-5 h-5 shrink-0" />
              )}
              <span>Message {firstName}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
