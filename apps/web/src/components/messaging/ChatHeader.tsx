import { Conversation } from './types';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Props {
  conversation: Conversation;
  onBack?: () => void;
  onOpenContext?: () => void;
}

export function ChatHeader({ conversation, onBack, onOpenContext }: Props) {
  const { otherUserName, otherUserAvatar, listingTitle, dailyRate, phase, listingId } = conversation;
  
  const getPhaseBadgeClasses = (phase: string) => {
    switch(phase) {
      case 'inquiry': return 'border border-[var(--foreground)] border-opacity-30 text-[var(--foreground)] opacity-50 bg-transparent';
      case 'pending': return 'bg-amber-500 text-black border-transparent';
      case 'confirmed': return 'bg-[var(--accent)] text-black border-transparent';
      case 'ongoing': return 'bg-[var(--accent)] text-black animate-[pulse_3s_ease-in-out_infinite] border-transparent shadow-[0_0_8px_var(--accent)]';
      case 'completed': return 'border border-[var(--foreground)] border-opacity-20 text-[var(--foreground)] opacity-40 bg-transparent';
      default: return '';
    }
  };

  return (
    <div 
      className="pt-3 pb-2 px-3 md:pt-4 md:pb-2 md:px-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--surface)] backdrop-blur-md z-10 sticky top-0 cursor-pointer md:cursor-default"
      onClick={onOpenContext}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }} 
            className="p-2 -ml-2 rounded-full hover:bg-[var(--foreground)] hover:bg-opacity-10 md:hidden flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full border border-[var(--border-color)] bg-[var(--background)] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          {otherUserAvatar ? (
            <img src={otherUserAvatar} alt={otherUserName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold">{otherUserName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        {/* Info */}
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-2 truncate">
            <h2 className="font-syne font-bold text-base md:text-lg truncate">{otherUserName}</h2>
            <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm flex-shrink-0 ${getPhaseBadgeClasses(phase)}`}>
              {phase}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] opacity-60 truncate">
            <Link href={`/listings/${listingId}` as any} onClick={(e) => e.stopPropagation()} className="hover:underline truncate font-medium">
              {listingTitle}
            </Link>
            <span>·</span>
            <span className="flex-shrink-0">Rs.{dailyRate}/day</span>
          </div>
        </div>
      </div>

      {/* Right Side context trigger button on Mobile & Tablet */}
      {onOpenContext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenContext();
          }}
          className="p-2.5 -mr-1 rounded-full hover:bg-[var(--foreground)] hover:bg-opacity-5 xl:hidden text-[var(--foreground)] opacity-70 hover:opacity-100 transition-all flex-shrink-0"
        >
          <ChevronDown size={20} className="stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
