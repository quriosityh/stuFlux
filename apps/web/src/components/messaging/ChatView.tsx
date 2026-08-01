'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** Server-annotated: true when the requesting user sent this message */
  viewer_is_sender?: boolean;
};

function formatTimestamp(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function mapMessage(item: ApiMessage): Message {
  return {
    id: item.id,
    senderId: item.sender_id,
    body: item.body,
    createdAt: formatTimestamp(item.created_at),
    rawCreatedAt: item.created_at ?? '',
    type: 'text',
    // viewer_is_sender is server-annotated on REST load; for SSE it won't be present
    viewerIsSender: item.viewer_is_sender,
  };
}

/** Merge a new message into the list, dedup by id, sort by rawCreatedAt ascending. */
function mergeMessage(prev: Message[], next: Message): Message[] {
  if (prev.some((m) => m.id === next.id)) return prev;
  return [...prev, next].sort((a, b) => a.rawCreatedAt.localeCompare(b.rawCreatedAt));
}

/** Replace a temp message (optimistic) with the confirmed one from the API. */
function replaceTemp(prev: Message[], tempId: string, confirmed: Message): Message[] {
  const without = prev.filter((m) => m.id !== tempId);
  return mergeMessage(without, confirmed);
}

export function ChatView({ conversation, onBack, onOpenContext, onConversationUpdated }: Props) {
  const { getToken, userId } = useAuth();
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const sseRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  // ─── Load messages ────────────────────────────────────────────────────────
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
          const sorted = payload.data
            .map(mapMessage)
            .sort((a, b) => a.rawCreatedAt.localeCompare(b.rawCreatedAt));
          setMessages(sorted);
        }

        // Mark as seen in background
        fetch(`/api/proxy/conversations/${conversation.id}/seen`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }).catch(() => {});
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [conversation.id, getToken]);

  // ─── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── SSE real-time stream with reconnect backoff ──────────────────────────
  useEffect(() => {
    if (!conversation.id || !userId) return;

    let es: EventSource | null = null;
    let active = true;

    const connect = () => {
      if (!active) return;
      es = new EventSource(`/api/conversations/${conversation.id}/stream`);

      es.onopen = () => {
        retryCountRef.current = 0; // reset backoff on successful connect
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ApiMessage;
          // Skip malformed or deleted messages
          if (!payload.id || !payload.body) return;

          const next = mapMessage(payload);
          setMessages((prev) => mergeMessage(prev, next));

          onConversationUpdated?.({
            ...conversation,
            lastMessage: {
              body: payload.body,
              createdAt: formatTimestamp(payload.created_at),
              rawCreatedAt: payload.created_at ?? '',
            },
            rawUpdatedAt: payload.created_at ?? conversation.rawUpdatedAt,
          });
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!active) return;

        // Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000);
        retryCountRef.current++;
        sseRetryRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      active = false;
      if (sseRetryRef.current) clearTimeout(sseRetryRef.current);
      es?.close();
    };
  }, [conversation.id, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isSending) return; // prevent double-send
      setIsSending(true);

      // Optimistic temp message
      const tempId = `temp-${Date.now()}`;
      const tempMsg: Message = {
        id: tempId,
        senderId: userId ?? '',
        body: text,
        createdAt: formatTimestamp(new Date().toISOString()),
        rawCreatedAt: new Date().toISOString(),
        type: 'text',
        viewerIsSender: true, // always right-aligned immediately
      };
      setMessages((prev) => mergeMessage(prev, tempMsg));

      try {
        const token = await getToken();
        if (!token) {
          // rollback optimistic
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const res = await fetch('/api/proxy/messages', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversation_id: conversation.id, body: text }),
        });

        if (!res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const payload = (await res.json()) as { data: ApiMessage };
        const confirmed = mapMessage(payload.data);

        // Replace the temp message with the real one (SSE may also deliver it
        // — mergeMessage deduplication ensures we won't double-add it)
        setMessages((prev) => replaceTemp(prev, tempId, confirmed));

        onConversationUpdated?.({
          ...conversation,
          lastMessage: {
            body: text,
            createdAt: formatTimestamp(payload.data.created_at),
            rawCreatedAt: payload.data.created_at ?? '',
          },
          rawUpdatedAt: payload.data.created_at ?? conversation.rawUpdatedAt,
          unreadCount: 0,
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversation, getToken, isSending, userId, onConversationUpdated],
  );

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
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-40 select-none">
            <span className="text-4xl">💬</span>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return <SystemMessage key={msg.id} message={msg} />;
            }

            // Use server-annotated viewerIsSender when available (avoids Clerk ID vs UUID mismatch).
            // For optimistic (temp) messages, senderId is the Clerk userId string — also correct.
            const isSentByMe = msg.viewerIsSender !== undefined
              ? msg.viewerIsSender
              : msg.id.startsWith('temp-') || msg.senderId === userId;
            const isTemp = msg.id.startsWith('temp-');
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            // Show avatar + name on the first bubble of a group from the other person
            const showSenderInfo =
              !isSentByMe &&
              (prevMsg?.senderId !== msg.senderId || prevMsg?.type === 'system');

            return (
              <ChatBubble
                key={msg.id}
                message={msg}
                isSentByMe={isSentByMe}
                isTemp={isTemp}
                showSenderInfo={showSenderInfo}
                senderName={conversation.otherUserName}
              />
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />

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
