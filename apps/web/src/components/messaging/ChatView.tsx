import { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from './types';
import { ChatHeader } from './ChatHeader';
import { ChatBubble } from './ChatBubble';
import { SystemMessage } from './SystemMessage';
import { ChatInput } from './ChatInput';
import { ContextPanel } from './ContextPanel';
import { X } from 'lucide-react';

interface Props {
  conversation: Conversation;
  isDesktop?: boolean;
  onBack?: () => void;
  onOpenContext?: () => void;
}

export function ChatView({ conversation, isDesktop, onBack, onOpenContext }: Props) {
  const [showMobileContext, setShowMobileContext] = useState(false);
  
  // Mock messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderId: 'me',
      body: 'Hi, I am interested in renting this.',
      createdAt: 'Yesterday, 2:00 PM',
      type: 'text'
    },
    {
      id: 'm2',
      senderId: conversation.otherUserId,
      body: 'Sure, it is available!',
      createdAt: 'Yesterday, 2:15 PM',
      type: 'text'
    },
    {
      id: 'm3',
      senderId: 'system',
      body: 'May 25 – May 28 (3 days)\nTotal: Rs. 7,500',
      createdAt: 'Yesterday, 2:30 PM',
      type: 'system',
      systemSubtype: 'booking_requested'
    },
    {
      id: 'm4',
      senderId: conversation.otherUserId,
      body: conversation.lastMessage?.body || 'Sounds good.',
      createdAt: conversation.lastMessage?.createdAt || 'Today, 10:00 AM',
      type: 'text'
    }
  ]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on load or new message
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation.id]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'me', // assuming 'me' is current user
      body: text,
      createdAt: 'Just now',
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOpenContext = () => {
    if (onOpenContext) {
      onOpenContext();
    } else {
      setShowMobileContext(true);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-[var(--background)]">
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onOpenContext={handleOpenContext} 
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide flex flex-col">
        {/* Messages List */}
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return <SystemMessage key={msg.id} message={msg} />;
          }
          
          const isSentByMe = msg.senderId === 'me';
          // Show avatar if received and previous message was from someone else or system
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showAvatar = !isSentByMe && (prevMsg?.senderId !== msg.senderId || prevMsg?.type === 'system');

          return (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              isSentByMe={isSentByMe} 
              showAvatar={showAvatar} 
            />
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} />

      {/* Mobile & Tablet Context Panel Sheet */}
      {showMobileContext && (
        <div className="absolute inset-0 z-50 bg-[var(--background)] flex flex-col xl:hidden animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--surface)] shrink-0 shadow-sm">
            <h2 className="font-bold text-lg">Details</h2>
            <button 
              onClick={() => setShowMobileContext(false)}
              className="p-2 -mr-2 rounded-full hover:bg-[var(--foreground)] hover:bg-opacity-10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-6">
            <ContextPanel conversation={conversation} isMobileSheet={true} />
          </div>
        </div>
      )}
    </div>
  );
}
