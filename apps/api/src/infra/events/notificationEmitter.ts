import { EventEmitter } from 'events';

export type NotificationEvent =
  | {
      type: 'booking_request';
      bookingId: string;
      listingTitle: string;
      renterName: string;
      startDate: string;
      endDate: string;
      conversationId: string;
    }
  | {
      type: 'booking_confirmed';
      bookingId: string;
      listingTitle: string;
      lenderName: string;
      startDate: string;
      endDate: string;
      conversationId: string;
    }
  | {
      type: 'booking_rejected';
      bookingId: string;
      listingTitle: string;
      startDate: string;
      endDate: string;
    }
  | {
      type: 'new_message';
      conversationId: string;
      senderName: string;
      preview: string;
    };

// This in-process emitter supports a single API instance. Use shared pub/sub
// before horizontally scaling the API across multiple processes.
export const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(0);

const userConnectionCount = new Map<string, number>();

export const trackUserStream = (userId: string): void => {
  userConnectionCount.set(userId, (userConnectionCount.get(userId) ?? 0) + 1);
};

export const untrackUserStream = (userId: string): void => {
  const count = userConnectionCount.get(userId) ?? 0;
  if (count <= 1) {
    userConnectionCount.delete(userId);
    return;
  }
  userConnectionCount.set(userId, count - 1);
};

export const isUserStreaming = (userId: string): boolean => {
  return (userConnectionCount.get(userId) ?? 0) > 0;
};
