import { pushRepository } from './repository.js';
import { subscribePushSchema, unsubscribePushSchema } from './validations.js';

export const subscribeToPush = async (userId: string, payload: unknown) => {
  const subscription = subscribePushSchema.parse(payload);
  await pushRepository.upsert(userId, subscription);
  return { status: 'subscribed' } as const;
};

export const unsubscribeFromPush = async (userId: string, payload: unknown) => {
  const { endpoint } = unsubscribePushSchema.parse(payload);
  await pushRepository.deleteForUser(userId, endpoint);
  return { status: 'unsubscribed' } as const;
};
