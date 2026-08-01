import { cn } from '@/lib/utils';
import { Conversation } from './types';
import { PhaseBadge } from './PhaseBadge';

export function ConversationPreview({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: Conversation; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const { 
    listingTitle, 
    listingImage, 
    otherUserName, 
    phase, 
    role, 
    rentalPeriod, 
    lastMessage, 
    unreadCount 
  } = conversation;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 flex gap-3 border-b border-[var(--border-color)] transition-colors hover:bg-[var(--surface)] hover:bg-opacity-50 group",
        isSelected && "bg-[var(--surface)] relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--accent)]"
      )}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-[60px] h-[60px]">
        {/* Item Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={listingImage} 
          alt={listingTitle} 
          className="w-full h-full object-cover rounded-xl border border-[var(--border-color)] shadow-sm"
        />
        {/* Avatar Overlay */}
        <div className="absolute -bottom-1.5 -right-1.5 w-[26px] h-[26px] rounded-full border-2 border-[var(--background)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-md">
          {/* We'll use an emoji fallback for the mock avatar */}
          <span className="text-[12px]">🧑</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Row 1: Role + Name on left, Time on right */}
        <div className="flex justify-between items-center gap-2 mb-1">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <span className="text-[11px] text-[var(--foreground)] opacity-60 flex-shrink-0">
              {role === 'renter' ? '📦 Renting from' : '🏠 Lending to'}
            </span>
            <span className={cn("text-[15px] font-bold truncate ml-1", unreadCount > 0 ? "text-[var(--foreground)]" : "text-[var(--foreground)] opacity-90")}>
              {otherUserName}
            </span>
          </div>
          <span className={cn("text-[11px] whitespace-nowrap flex-shrink-0", unreadCount > 0 ? "text-[var(--accent)] font-semibold" : "text-[var(--foreground)] opacity-40")}>
            {lastMessage?.createdAt || ''}
          </span>
        </div>

        {/* Row 2: Listing Title and Phase Badge */}
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--foreground)] opacity-75 truncate">
            {listingTitle}
          </div>
          <span className="text-[var(--foreground)] opacity-40 text-[10px] flex-shrink-0">•</span>
          <PhaseBadge phase={phase} />
        </div>

        {/* Row 3: Last Message on left, Unread Badge on right */}
        <div className="flex justify-between items-center gap-2 mt-0.5">
          <div className={cn("text-[13px] truncate flex-1 leading-normal", unreadCount > 0 ? "text-[var(--foreground)] opacity-95 font-medium" : "text-[var(--foreground)] opacity-55")}>
            {lastMessage?.body || 'No messages yet'}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 min-h-[18px]">
            {unreadCount > 0 && (
              <div className="bg-[var(--accent)] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_8px_var(--accent)] flex items-center justify-center min-w-[18px] h-[18px] flex-shrink-0">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
