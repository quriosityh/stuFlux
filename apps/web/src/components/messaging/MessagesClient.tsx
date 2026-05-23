'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { ContextPanel } from './ContextPanel';
import { EmptyChat, EmptyInbox } from './EmptyViews';
import { Conversation } from './types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function MessagesClient({ initialConversationId }: { initialConversationId?: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | undefined>(initialConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState('All');
  const [activePhase, setActivePhase] = useState('All');

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false); // md: 768px - 1279px
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    
    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data loading
  useEffect(() => {
    setTimeout(() => {
      setConversations([
        {
          id: '1',
          listingId: 'l1',
          listingTitle: 'Sony A7IV Camera Body',
          listingImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 2500,
          otherUserId: 'u2',
          otherUserName: 'Ahmed K.',
          phase: 'pending',
          role: 'renter',
          rentalPeriod: { startDate: 'May 25', endDate: 'May 28' },
          lastMessage: { body: 'Hey is this still available for the weekend?', createdAt: '2:30 PM' },
          unreadCount: 3,
        },
        {
          id: '2',
          listingId: 'l2',
          listingTitle: 'DJI Mavic 3 Pro',
          listingImage: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 4000,
          otherUserId: 'u3',
          otherUserName: 'Sarah M.',
          phase: 'ongoing',
          role: 'lender',
          rentalPeriod: { startDate: 'May 20', endDate: 'May 24' },
          lastMessage: { body: 'Just picked it up, thanks!', createdAt: 'Yesterday' },
          unreadCount: 0,
        },
        {
          id: '3',
          listingId: 'l3',
          listingTitle: 'Camping Tent 4-Person',
          listingImage: 'https://images.unsplash.com/photo-1504280390227-3ebde2225812?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 800,
          otherUserId: 'u4',
          otherUserName: 'Omar R.',
          phase: 'inquiry',
          role: 'renter',
          lastMessage: { body: 'Does it come with a rainfly?', createdAt: 'May 15' },
          unreadCount: 0,
        },
        {
          id: '4',
          listingId: 'l4',
          listingTitle: 'Honda Civic 2022',
          listingImage: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 5000,
          otherUserId: 'u5',
          otherUserName: 'Rahul S.',
          phase: 'confirmed',
          role: 'renter',
          rentalPeriod: { startDate: 'Jun 01', endDate: 'Jun 05' },
          lastMessage: { body: 'Perfect, I will see you at the pickup location.', createdAt: '3 hr ago' },
          unreadCount: 1,
        },
        {
          id: '5',
          listingId: 'l5',
          listingTitle: 'MacBook Pro M2 Pro',
          listingImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 3500,
          otherUserId: 'u6',
          otherUserName: 'John D.',
          phase: 'inquiry',
          role: 'lender',
          lastMessage: { body: 'Hi! Can this handle rendering 4K video projects easily?', createdAt: '4 hr ago' },
          unreadCount: 0,
        },
        {
          id: '6',
          listingId: 'l6',
          listingTitle: 'Fender Stratocaster Electric Guitar',
          listingImage: 'https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 1500,
          otherUserId: 'u7',
          otherUserName: 'Elena P.',
          phase: 'completed',
          role: 'renter',
          rentalPeriod: { startDate: 'May 10', endDate: 'May 12' },
          lastMessage: { body: 'Return completed! Left you a 5-star review, really loved the guitar.', createdAt: 'May 12' },
          unreadCount: 0,
        },
        {
          id: '7',
          listingId: 'l7',
          listingTitle: 'Giant TCR Advanced Road Bike',
          listingImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 1200,
          otherUserId: 'u8',
          otherUserName: 'Carlos V.',
          phase: 'pending',
          role: 'lender',
          rentalPeriod: { startDate: 'May 28', endDate: 'May 30' },
          lastMessage: { body: 'Hey, would it be possible to extend the rental by one day?', createdAt: 'May 18' },
          unreadCount: 2,
        },
        {
          id: '8',
          listingId: 'l8',
          listingTitle: 'Heavy Duty SDS Hammer Drill',
          listingImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1000&auto=format&fit=crop',
          dailyRate: 500,
          otherUserId: 'u9',
          otherUserName: 'Vikram G.',
          phase: 'confirmed',
          role: 'lender',
          rentalPeriod: { startDate: 'May 26', endDate: 'May 27' },
          lastMessage: { body: 'Got it, I\'ll have it cleaned and ready for you.', createdAt: 'May 17' },
          unreadCount: 0,
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  // Sync selectedId with URL on mobile
  useEffect(() => {
    if (isMobile) {
      if (selectedId && !initialConversationId) {
        router.push(`/messages/${selectedId}` as any);
      }
    }
  }, [selectedId, isMobile, initialConversationId, router]);

  // Hide global mobile nav if inside a chat on mobile
  useEffect(() => {
    if (isMobile && selectedId) {
      // We will add a global style or class to hide the bottom nav
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

  // Derived filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Role match
      if (activeRole === 'As Renter' && c.role !== 'renter') return false;
      if (activeRole === 'As Lender' && c.role !== 'lender') return false;
      if (activeRole === 'Unread' && c.unreadCount === 0) return false;


      // Phase match
      if (activePhase !== 'All' && c.phase.toLowerCase() !== activePhase.toLowerCase()) return false;

      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.otherUserName.toLowerCase().includes(q) && !c.listingTitle.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, activeRole, activePhase, searchQuery]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>;
  }

  if (conversations.length === 0) {
    return <EmptyInbox />;
  }

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const bottomClass = isMobile && selectedId ? 'bottom-0' : 'bottom-16';

  // Viewport-locked unified layout wrapper to guarantee UI stability under zooming and resizing
  return (
    <div className={cn(
      "fixed top-0 md:top-16 left-0 right-0 flex overflow-hidden max-w-[1600px] mx-auto w-full bg-[var(--background)] shadow-2xl border-x border-[var(--border-color)] md:bottom-0",
      bottomClass
    )}>
      {isMobile ? (
        selectedId && selectedConversation ? (
          <div className="flex-1 flex flex-col h-full bg-[var(--background)] z-50">
            <ChatView 
              conversation={selectedConversation} 
              onBack={() => {
                setSelectedId(undefined);
                router.push('/messages' as any);
              }} 
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
          {/* Inbox List Column - fixed width */}
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

          {/* Chat View Column - flex-1 */}
          <div className="flex-1 flex flex-col h-full min-w-0 relative">
            {selectedId && selectedConversation ? (
              <ChatView 
                conversation={selectedConversation} 
                isDesktop
                onOpenContext={isTablet ? undefined : () => {}}
              />
            ) : (
              <EmptyChat />
            )}
          </div>

          {/* Context Panel Column - fixed width, only shown when >= 1280px */}
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
