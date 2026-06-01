export type ConversationPhase = 'inquiry' | 'pending' | 'confirmed' | 'ongoing' | 'completed';

export interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  type?: 'text' | 'system';
  systemSubtype?: string;
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
    createdAt: string;
  };
  unreadCount: number;
}
