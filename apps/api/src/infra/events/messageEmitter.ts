import { EventEmitter } from 'events';

// Central emitter for conversation-specific events (in-memory, single-instance only).
export const messageEmitter = new EventEmitter();
messageEmitter.setMaxListeners(0); // unlimited listeners to avoid warnings in SSE fan-out

export type MessageEventPayload = {
  conversationId: string;
  message: any;
};

// Active SSE streams tracker: Map<conversationId, Set<userId>>
export const activeStreams = new Map<string, Set<string>>();

export const trackStream = (conversationId: string, userId: string) => {
  if (!activeStreams.has(conversationId)) {
    activeStreams.set(conversationId, new Set());
  }
  activeStreams.get(conversationId)!.add(userId);
};

export const untrackStream = (conversationId: string, userId: string) => {
  const users = activeStreams.get(conversationId);
  if (users) {
    users.delete(userId);
    if (users.size === 0) {
      activeStreams.delete(conversationId);
    }
  }
};

export const isUserConnected = (conversationId: string, userId: string): boolean => {
  return activeStreams.get(conversationId)?.has(userId) ?? false;
};

