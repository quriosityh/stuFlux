import webpush from 'web-push';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pushSubscriptions } from '../../../db/schema.js';

export type PushPayload = {
  type: string;
  title: string;
  body: string;
  url: string;
};

let configuredVapidKey: string | null = null;

const configureVapid = (): boolean => {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    console.warn('[push] VAPID is not configured; skipping push delivery');
    return false;
  }

  const configurationKey = `${subject}:${publicKey}:${privateKey}`;
  if (configuredVapidKey !== configurationKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configuredVapidKey = configurationKey;
  }

  return true;
};

/** Sends best-effort Web Push notifications without affecting the calling flow. */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    if (!configureVapid()) return;

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_id, userId));

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
        } else {
          console.error('[push] Failed to send notification:', error?.message ?? error);
        }
      }
    }
  } catch (error: any) {
    console.error('[push] Failed to deliver notifications:', error?.message ?? error);
  }
}
