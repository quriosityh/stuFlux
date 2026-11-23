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

function mapMessage(item: ApiMessage, viewerIsSender?: boolean): Message {
  return {
    id: item.id,
    senderId: item.sender_id,
    body: item.body,
    createdAt: formatTimestamp(item.created_at),
    rawCreatedAt: item.created_at ?? '',
    type: 'text',
    viewerIsSender: viewerIsSender !== undefined ? viewerIsSender : item.viewer_is_sender,
  };
}

/**
 * Upsert a message into the list by id. Dedup and keep ascending order.
 * Also replaces any temp message whose body matches (optimistic → confirmed).
 */
function upsertMessage(prev: Message[], next: Message): Message[] {
  // Already have this exact id (e.g. SSE duplicate) → keep old entry (don't overwrite viewerIsSender)
  if (prev.some((m) => m.id === next.id)) {
    // update in-place to get confirmed viewerIsSender if it was undefined
    return prev.map((m) => (m.id === next.id ? { ...m, ...next } : m));
  }
  return [...prev, next].sort((a, b) => a.rawCreatedAt.localeCompare(b.rawCreatedAt));
}

export function ChatView({ conversation, onBack, onOpenContext, onConversationUpdated }: Props) {
  const { getToken } = useAuth();

  const [showMobileContext, setShowMobileContext] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const sseRetryRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef    = useRef(0);

  // Track temp IDs that have been confirmed so SSE duplicates get discarded
  const confirmedTempMap = useRef<Map<string, string>>(new Map()); // tempId → confirmedId

  // ── Load messages ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoadingMessages(true);
    setMessages([]);
    confirmedTempMap.current.clear();

    const loadMessages = async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const res = await fetch(`/api/proxy/conversations/${conversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const payload = (await res.json()) as { data: ApiMessage[] };
        if (!cancelled) {
          setMessages(payload.data.map((m) => mapMessage(m, m.viewer_is_sender)));
        }

        // Mark seen — fire and forget
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
    return () => { cancelled = true; };
  }, [conversation.id, getToken]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── SSE real-time stream with reconnect backoff ──────────────────────────
  useEffect(() => {
    if (!conversation.id) return;

    let es: EventSource | null = null;
    let active = true;

    const connect = () => {
      if (!active) return;
      es = new EventSource(`/api/conversations/${conversation.id}/stream`);

      es.onopen = () => { retryCountRef.current = 0; };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ApiMessage;
          if (!payload.id || !payload.body) return;

          // Determine viewer side for SSE messages (no server annotation)
          const viewerIsSender = payload.sender_id !== conversation.otherUserId;

          setMessages((prev) => {
            // If we have a temp message with the same body sent very recently by viewer,
            // replace the temp with this confirmed message
            if (viewerIsSender) {
              const tempIdx = prev.findIndex(
                (m) => m.id.startsWith('temp-') && m.body === payload.body && m.viewerIsSender === true
              );
              if (tempIdx !== -1) {
                const tempId = prev[tempIdx].id;
                confirmedTempMap.current.set(tempId, payload.id);
                const without = prev.filter((_, i) => i !== tempIdx);
                return upsertMessage(without, mapMessage(payload, true));
              }
            }

            return upsertMessage(prev, mapMessage(payload, viewerIsSender));
          });

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
  }, [conversation.id, conversation.otherUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isSending) return;
      setIsSending(true);

      // Optimistic temp message — appears instantly before round-trip
      const tempId = `temp-${Date.now()}`;
      const nowIso = new Date().toISOString();
      const tempMsg: Message = {
        id: tempId,
        senderId: 'me',
        body: text,
        createdAt: formatTimestamp(nowIso),
        rawCreatedAt: nowIso,
        type: 'text',
        viewerIsSender: true,
      };
      setMessages((prev) => upsertMessage(prev, tempMsg));

      try {
        const token = await getToken();
        if (!token) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const res = await fetch('/api/proxy/messages', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversation.id, body: text }),
        });

        if (!res.ok) {
          // Remove temp on failure
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const payload = (await res.json()) as { data: ApiMessage };
        const confirmed: Message = mapMessage(payload.data, true);

        // Replace the temp message with the confirmed one.
        // If SSE already delivered and replaced it, this is a no-op.
        setMessages((prev) => {
          // Check if SSE already replaced this temp (confirmedTempMap has it)
          const alreadyConfirmedId = confirmedTempMap.current.get(tempId);
          if (alreadyConfirmedId) {
            // SSE already replaced it — just make sure we update with the right id
            return prev.map((m) =>
              m.id === alreadyConfirmedId ? { ...m, ...confirmed } : m
            );
          }
          // SSE not arrived yet — replace temp directly
          const without = prev.filter((m) => m.id !== tempId);
          return upsertMessage(without, confirmed);
        });

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
    [conversation, getToken, isSending, onConversationUpdated],
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

            const isSentByMe = msg.viewerIsSender !== undefined
              ? msg.viewerIsSender
              : msg.id.startsWith('temp-') || msg.senderId !== conversation.otherUserId;
            const isTemp = msg.id.startsWith('temp-');
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
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
                senderAvatar={conversation.otherUserAvatar}
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
