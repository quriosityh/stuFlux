import { Conversation } from './types';
import { ContextListingCard } from './ContextListingCard';
import { ContextBookingDetails } from './ContextBookingDetails';
import { ContextActions } from './ContextActions';

export function ContextPanel({ conversation, isMobileSheet }: { conversation: Conversation; isMobileSheet?: boolean }) {
  return (
    <div className={`flex flex-col h-full overflow-y-auto scrollbar-hide ${isMobileSheet ? 'p-4' : 'py-5 px-5'} bg-[var(--surface)]`}>
      <div className="flex flex-col gap-6 pt-1">
        <ContextListingCard conversation={conversation} />
        <ContextBookingDetails conversation={conversation} />
        <ContextActions conversation={conversation} />
        
        {/* Other User Info */}
        <div className="flex flex-col gap-2">
          <h3 className="font-syne font-bold text-[10px] text-[var(--foreground)] opacity-60 uppercase tracking-wider">
            {conversation.role === 'renter' ? 'Lender' : 'Renter'}
          </h3>
          <div className="flex items-center justify-between chrome-card p-3.5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-[var(--border-color)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                <span className="text-3xl">🧑</span>
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--foreground)]">{conversation.otherUserName}</div>
                <div className="text-xs opacity-65 mt-0.5">★ 4.9 · 12 rentals</div>
              </div>
            </div>
            <button className="text-xs font-bold text-[var(--accent)] hover:underline flex-shrink-0">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
