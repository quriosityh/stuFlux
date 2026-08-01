import { and, eq } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { pushSubscriptions } from '../../../db/schema.js';
import type { SubscribePushInput } from './validations.js';

export const pushRepository = {
  async upsert(userId: string, subscription: SubscribePushInput) {
    const [row] = await db
      .insert(pushSubscriptions)
      .values({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          user_id: userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      })
      .returning();
    return row;
  },

  async deleteForUser(userId: string, endpoint: string) {
    const [row] = await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.endpoint, endpoint)))
      .returning({ id: pushSubscriptions.id });
    return row ?? null;
  },
};
