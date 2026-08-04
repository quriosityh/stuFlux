import { notificationEmitter, type NotificationEvent } from '../../infra/events/notificationEmitter.js';
import { notificationsRepository } from './repository.js';

export const publishNotification = async (userId: string, event: NotificationEvent) => {
  try {
    const notification = await notificationsRepository.create(userId, event);
    notificationEmitter.emit(`user:${userId}`, { ...event, notificationId: notification.id });
    return notification;
  } catch (error) {
    console.error('[notifications] Failed to persist notification:', error);
    return null;
  }
};

export const getNotifications = (userId: string) => notificationsRepository.listForUser(userId);
export const markNotificationRead = (userId: string, id: string) => notificationsRepository.markRead(userId, id);
export const markAllNotificationsRead = (userId: string) => notificationsRepository.markAllRead(userId);
