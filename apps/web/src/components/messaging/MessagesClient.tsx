'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { ContextPanel } from './ContextPanel';
import { EmptyChat, EmptyInbox } from './EmptyViews';
import { Conversation } from './types';
import { cn } from '@/lib/utils';
import type { InAppNotification } from '@/components/NotificationStream';

type ApiConversation = {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  booking_id?: string | null;
  created_at: string;
  updated_at: string;
  listing_title: string;
  listing_daily_rate?: number | null;
  booking_status?: string | null;
  booking_start_date?: string | null;
  booking_end_date?: string | null;
  booking_total_amount?: number | null;
  renter_display_name?: string | null;
  renter_avatar_url?: string | null;
  owner_display_name?: string | null;
  owner_avatar_url?: string | null;
  listing_photo_url?: string | null;
  phase?: string | null;
  viewer_role?: 'renter' | 'lender' | null;
  last_message?: {
    id: string;
    body: string;
    created_at: string;
    sender_id: string;
    conversation_id: string;
  } | null;
  unread_count?: number | null;
};

function formatTimestamp(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function mapConversation(item: ApiConversation, currentUserId?: string | null): Conversation {
  const isRenter = item.viewer_role
    ? item.viewer_role === 'renter'
    : currentUserId === item.renter_id;

  const otherUserName   = isRenter ? item.owner_display_name  ?? 'Owner'  : item.renter_display_name ?? 'Renter';
  const otherUserId     = isRenter ? item.owner_id : item.renter_id;
  const otherUserAvatar = isRenter ? item.owner_avatar_url  ?? undefined : item.renter_avatar_url ?? undefined;
  const listingImage    = item.listing_photo_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop';

  const rawUpdatedAt = item.last_message?.created_at ?? item.updated_at ?? item.created_at ?? '';

  return {
    id: item.id,
    listingId: item.listing_id,
    listingTitle: item.listing_title || 'Listing',
    listingImage,
    dailyRate: item.listing_daily_rate ?? 0,
    otherUserId,
    otherUserName,
    otherUserAvatar,
    bookingId: item.booking_id ?? undefined,
    bookingTotalAmount: item.booking_total_amount ?? undefined,
    phase: (item.phase as Conversation['phase']) ?? 'inquiry',
    role: isRenter ? 'renter' : 'lender',
    rentalPeriod: item.booking_start_date && item.booking_end_date
      ? {
          startDate: formatTimestamp(item.booking_start_date),
          endDate: formatTimestamp(item.booking_end_date),
          rawStartDate: item.booking_start_date,
          rawEndDate: item.booking_end_date,
        }
      : undefined,
    lastMessage: item.last_message
      ? {
          body: item.last_message.body,
          createdAt: formatTimestamp(item.last_message.created_at),
          rawCreatedAt: item.last_message.created_at ?? '',
        }
      : undefined,
    unreadCount: item.unread_count ?? 0,
    rawUpdatedAt,
  };
}

export function MessagesClient({ initialConversationId }: { initialConversationId?: string }) {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [selectedId, setSelectedId] = useState<string | undefined>(initialConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery]   = useState('');
  const [activeRole, setActiveRole]     = useState('All');
  const [activePhase, setActivePhase]   = useState('All');

  const [isMobile, setIsMobile]   = useState(false);
  const [isTablet, setIsTablet]   = useState(false);

  // ── Responsive breakpoints ────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Load conversations ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) { setConversations([]); setIsLoading(false); }
        return;
      }

      try {
        const res = await fetch('/api/proxy/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load conversations');
        const payload = (await res.json()) as { data: ApiConversation[] };
        if (!cancelled) {
          const mapped = payload.data.map((item) => mapConversation(item, userId));
          mapped.sort((a, b) => b.rawUpdatedAt.localeCompare(a.rawUpdatedAt));
          setConversations(mapped);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setConversations([]); setIsLoading(false); }
      }
    };

    void loadConversations();
    return () => { cancelled = true; };
  }, [getToken, userId]);

  // ── Real-time inbox: listen to global notification events ─────────────────
  // When a new_message SSE notification fires for a conversation we're NOT
  // currently viewing, update that conversation's preview without a full refetch.
  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent<InAppNotification>).detail;
      if (notif.type !== 'new_message') return;

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === notif.conversationId);
        if (!exists) return prev; // new conversation — let next page load pick it up

        const now = new Date().toISOString();
        const next = prev.map((c) =>
          c.id !== notif.conversationId
            ? c
            : {
                ...c,
                lastMessage: {
                  body: notif.preview,
                  createdAt: formatTimestamp(now),
                  rawCreatedAt: now,
                },
                // Only increment unread if this conversation isn't currently open
                unreadCount: selectedId === notif.conversationId ? c.unreadCount : c.unreadCount + 1,
                rawUpdatedAt: now,
              },
        );
        next.sort((a, b) => b.rawUpdatedAt.localeCompare(a.rawUpdatedAt));
        return next;
      });
    };

    window.addEventListener('stuflux:notification', handler);
    return () => window.removeEventListener('stuflux:notification', handler);
  }, [selectedId]);

  // ── Mobile: redirect to dedicated page ───────────────────────────────────
  useEffect(() => {
    if (isMobile && selectedId && !initialConversationId) {
      router.push(`/messages/${selectedId}` as any);
    }
  }, [selectedId, isMobile, initialConversationId, router]);

  // ── Mobile: hide bottom nav when in a chat ───────────────────────────────
  useEffect(() => {
    if (isMobile && selectedId) {
      document.body.style.paddingBottom = '0px';
      const nav = document.querySelector('nav.md\\:hidden') as HTMLElement;
      if (nav) nav.style.display = 'none';
    } else {
      document.body.style.paddingBottom = '';
      const nav = document.querySelector('nav.md\\:hidden') as HTMLElement;
      if (nav) nav.style.display = '';
    }
    return () => {
      document.body.style.paddingBottom = '';
      const nav = document.querySelector('nav.md\\:hidden') as HTMLElement;
      if (nav) nav.style.display = '';
    };
  }, [isMobile, selectedId]);

  // ── Conversation update callback (from ChatView after send / SSE receive) ─
  const handleConversationUpdated = (updated: Conversation) => {
    setConversations((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      next.sort((a, b) => b.rawUpdatedAt.localeCompare(a.rawUpdatedAt));
      return next;
    });
  };

  // ── Filter conversations ──────────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (activeRole === 'As Renter'  && c.role !== 'renter') return false;
      if (activeRole === 'As Lender'  && c.role !== 'lender') return false;
      if (activeRole === 'Unread'     && c.unreadCount === 0) return false;
      if (activePhase !== 'All' && c.phase.toLowerCase() !== activePhase.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.otherUserName.toLowerCase().includes(q) && !c.listingTitle.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [conversations, activeRole, activePhase, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (conversations.length === 0) return <EmptyInbox />;

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const bottomClass = isMobile && selectedId ? 'bottom-0' : 'bottom-16';

  return (
    <div
      className={cn(
        'fixed top-0 md:top-16 left-0 right-0 flex overflow-hidden max-w-[1600px] mx-auto w-full bg-[var(--background)] shadow-2xl border-x border-[var(--border-color)] md:bottom-0',
        bottomClass,
      )}
    >
      {isMobile ? (
        selectedId && selectedConversation ? (
          <div className="flex-1 flex flex-col h-full bg-[var(--background)] z-50">
            <ChatView
              conversation={selectedConversation}
              onBack={() => { setSelectedId(undefined); router.push('/messages' as any); }}
              onConversationUpdated={handleConversationUpdated}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)]">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              activePhase={activePhase}
              setActivePhase={setActivePhase}
            />
          </div>
        )
      ) : (
        <>
          <div className="w-[400px] border-r border-[var(--border-color)] flex flex-col h-full flex-shrink-0 bg-[var(--surface)] z-10">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              activePhase={activePhase}
              setActivePhase={setActivePhase}
            />
          </div>

          <div className="flex-1 flex flex-col h-full min-w-0 relative">
            {selectedId && selectedConversation ? (
              <ChatView
                conversation={selectedConversation}
                isDesktop
                onOpenContext={isTablet ? undefined : () => {}}
                onConversationUpdated={handleConversationUpdated}
              />
            ) : (
              <EmptyChat />
            )}
          </div>

          {!isTablet && selectedId && selectedConversation && (
            <div className="w-[380px] border-l border-[var(--border-color)] flex flex-col h-full flex-shrink-0 bg-[var(--surface)] z-10">
              <ContextPanel conversation={selectedConversation} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
