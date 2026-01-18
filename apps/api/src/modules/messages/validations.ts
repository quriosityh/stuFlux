import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(1000),
  listing_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
}).refine((data) => !!data.listing_id || !!data.conversation_id, {
  message: 'listing_id or conversation_id is required',
  path: ['listing_id'],
});

export const listMessagesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).max(1000).default(0),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
