import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { notifications } from '../../../db/schema.js';
import type { NotificationEvent } from '../../infra/events/notificationEmitter.js';

export const notificationsRepository = {
  async create(userId: string, event: NotificationEvent) {
    const [row] = await db
      .insert(notifications)
      .values({ user_id: userId, type: event.type, payload: event })
      .returning();
    return row;
  },

  async listForUser(userId: string, limit = 50) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(limit);
  },

  async markRead(userId: string, id: string) {
    const [row] = await db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)))
      .returning();
    return row ?? null;
  },

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(eq(notifications.user_id, userId));
  },
};
