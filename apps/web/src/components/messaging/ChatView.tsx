import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
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
  onConversationUpdated?: (conversation: Conversation) => void;
}

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  delivered_at?: string | null;
  deleted_at?: string | null;
};

function formatTimestamp(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function mapMessage(item: ApiMessage, currentUserId?: string | null): Message {
  return {
    id: item.id,
    senderId: item.sender_id,
    body: item.body,
    createdAt: formatTimestamp(item.created_at),
    type: 'text',
  };
}

export function ChatView({ conversation, onBack, onOpenContext, onConversationUpdated }: Props) {
  const { getToken, userId } = useAuth();
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      const token = await getToken();
      if (!token) return;

      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/proxy/conversations/${conversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load messages');
        const payload = (await res.json()) as { data: ApiMessage[] };
        if (!cancelled) {
          setMessages(payload.data.map((item) => mapMessage(item, userId)));
        }

        try {
          await fetch(`/api/proxy/conversations/${conversation.id}/seen`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
        } catch {
          // ignore
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [conversation.id, getToken, userId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation.id]);

  useEffect(() => {
    if (!conversation.id || !userId) return;

    const eventSource = new EventSource(`/api/conversations/${conversation.id}/stream`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ApiMessage;
        const nextMessage = mapMessage(payload, userId);
        setMessages((prev) => {
          if (prev.some((item) => item.id === nextMessage.id)) return prev;
          return [...prev, nextMessage];
        });
        onConversationUpdated?.({
          ...conversation,
          lastMessage: { body: payload.body, createdAt: formatTimestamp(payload.created_at) },
        });
      } catch {
        // ignore malformed events
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [conversation, onConversationUpdated, userId]);

  const handleSendMessage = async (text: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch('/api/proxy/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id: conversation.id, body: text }),
    });

    if (!res.ok) return;
    const payload = (await res.json()) as { data: ApiMessage };
    const nextMessage = mapMessage(payload.data, userId);
    setMessages((prev) => [...prev, nextMessage]);
    onConversationUpdated?.({
      ...conversation,
      lastMessage: { body: text, createdAt: formatTimestamp(payload.data.created_at) },
      unreadCount: 0,
    });
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
      <ChatHeader conversation={conversation} onBack={onBack} onOpenContext={handleOpenContext} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide flex flex-col">
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return <SystemMessage key={msg.id} message={msg} />;
            }

            const isSentByMe = msg.senderId === userId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !isSentByMe && (prevMsg?.senderId !== msg.senderId || prevMsg?.type === 'system');

            return <ChatBubble key={msg.id} message={msg} isSentByMe={isSentByMe} showAvatar={showAvatar} />;
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} />

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
