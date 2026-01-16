import { and, desc, eq, isNull, ne, or, sql } from 'drizzle-orm';
import { db } from '../../infra/db/client.js';
import { conversations, messages } from '../../../db/schema.js';

export const messagesRepository = {
  ensureConversation: async (listingId: string, renterId: string, ownerId: string) => {
    await db
      .insert(conversations)
      .values({ listing_id: listingId, renter_id: renterId, owner_id: ownerId })
      .onConflictDoNothing();

    return db.query.conversations.findFirst({
      where: and(eq(conversations.listing_id, listingId), eq(conversations.renter_id, renterId)),
    });
  },

  findConversationById: async (conversationId: string) => {
    return db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });
  },

  listConversationsForUser: async (userId: string) => {
    const convs = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.renter_id, userId), eq(conversations.owner_id, userId)))
      .orderBy(desc(conversations.updated_at));

    const results = await Promise.all(
      convs.map(async (conv) => {
        const last = await db
          .select()
          .from(messages)
          .where(eq(messages.conversation_id, conv.id))
          .orderBy(desc(messages.created_at))
          .limit(1);

        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.conversation_id, conv.id),
              ne(messages.sender_id, userId),
              isNull(messages.read_at)
            )
          );

        return {
          ...conv,
          last_message: last[0] ?? null,
          unread_count: Number(unreadCount[0]?.count ?? 0),
        };
      })
    );

    return results;
  },

  getMessages: async (conversationId: string, limit: number, offset: number) => {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .offset(offset);
  },

  addMessage: async (conversationId: string, senderId: string, body: string) => {
    const inserted = await db
      .insert(messages)
      .values({ conversation_id: conversationId, sender_id: senderId, body })
      .returning();

    // keep conversation updated_at fresh
    await db
      .update(conversations)
      .set({ updated_at: new Date() })
      .where(eq(conversations.id, conversationId));

    return inserted[0];
  },

  markConversationRead: async (conversationId: string, userId: string) => {
    return db
      .update(messages)
      .set({ read_at: new Date() })
      .where(and(eq(messages.conversation_id, conversationId), ne(messages.sender_id, userId), isNull(messages.read_at)));
  },

  softDeleteMessage: async (messageId: string, userId: string) => {
    const updated = await db
      .update(messages)
      .set({ deleted_at: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.sender_id, userId)))
      .returning();
    return updated[0] ?? null;
  },

  markDelivered: async (messageId: string) => {
    const updated = await db
      .update(messages)
      .set({ delivered_at: new Date() })
      .where(eq(messages.id, messageId))
      .returning();
    return updated[0] ?? null;
  },

  markDeliveredBulk: async (messageIds: string[]) => {
    if (messageIds.length === 0) return [];
    return db
      .update(messages)
      .set({ delivered_at: new Date() })
      .where(sql`${messages.id} = ANY(${messageIds})`);
  },

  getUndeliveredMessages: async (conversationId: string, userId: string) => {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          ne(messages.sender_id, userId),
          isNull(messages.delivered_at)
        )
      );
  },
};
