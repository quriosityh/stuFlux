export type ConversationPhase = 'inquiry' | 'pending' | 'confirmed' | 'ongoing' | 'completed';

export interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;       // formatted display string
  rawCreatedAt: string;    // ISO string for sorting
  type?: 'text' | 'system';
  systemSubtype?: string;
  /** Server-annotated on REST load. undefined for optimistic/SSE messages — use senderId fallback. */
  viewerIsSender?: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  dailyRate: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  phase: ConversationPhase;
  role: 'renter' | 'lender';
  rentalPeriod?: {
    startDate: string;
    endDate: string;
  };
  lastMessage?: {
    body: string;
    createdAt: string;     // formatted display string
    rawCreatedAt: string;  // ISO string for sorting
  };
  unreadCount: number;
  rawUpdatedAt: string;    // ISO string for sorting conversation list
}
