import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from './types';
import { ConversationPreview } from './ConversationPreview';
import { ConversationFilters } from './ConversationFilters';

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeRole: string;
  setActiveRole: (r: string) => void;
  activePhase: string;
  setActivePhase: (p: string) => void;
}

export function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect,
  searchQuery,
  setSearchQuery,
  activeRole,
  setActiveRole,
  activePhase,
  setActivePhase
}: Props) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4 min-h-[40px]">
          {!isSearchExpanded ? (
            <>
              <h1 className="font-syne font-bold text-2xl">Messages</h1>
              <button 
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 hover:bg-[var(--surface)] hover:bg-opacity-50 rounded-full transition-colors text-[var(--foreground)] opacity-70 hover:opacity-100"
                aria-label="Search messages"
              >
                <Search size={20} />
              </button>
            </>
          ) : (
            <div className="relative w-full flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-[var(--foreground)] opacity-40" />
                </div>
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or item..." 
                  className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--foreground)] placeholder:opacity-40"
                />
              </div>
              <button 
                onClick={() => {
                  setIsSearchExpanded(false);
                  if (!searchQuery) setSearchQuery('');
                }}
                className="p-1.5 hover:bg-[var(--surface)] rounded-full transition-colors flex-shrink-0 text-[var(--foreground)] opacity-70 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <ConversationFilters 
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          activePhase={activePhase}
          setActivePhase={setActivePhase}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-[var(--foreground)] opacity-50 text-sm">
            No conversations match your filters.
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationPreview 
              key={conv.id} 
              conversation={conv} 
              isSelected={conv.id === selectedId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
