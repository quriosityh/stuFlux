import { and, desc, eq, isNull, ne, or, sql, inArray, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../infra/db/client.js';
import { bookings, conversations, listings, listingPhotos, messages, users } from '../../../db/schema.js';

// Aliased user table references for the two-user self-join in listConversationsForUser
const renterUser = alias(users, 'renter_user');
const ownerUser  = alias(users, 'owner_user');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConversationPhase =
  | 'inquiry'
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'completed';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Derives the conversation phase from the linked booking status. */
function derivePhase(bookingStatus: string | null | undefined): ConversationPhase {
  if (!bookingStatus) return 'inquiry';
  switch (bookingStatus) {
    case 'pending':   return 'pending';
    case 'confirmed': return 'confirmed';
    case 'rejected':  return 'rejected';
    case 'completed': return 'completed';
    default:          return 'inquiry';
  }
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export const messagesRepository = {

  // -------------------------------------------------------------------------
  // Conversations
  // -------------------------------------------------------------------------

  /**
   * Ensures an INQUIRY conversation exists for the (listing, renter) pair.
   * Used when a renter messages a lender before selecting booking dates.
   *
   * The partial unique index `conversations_inquiry_unique_idx` guarantees
   * there is at most one inquiry thread per pair (booking_id IS NULL).
   * If one already exists it is returned unchanged.
   */
  ensureInquiryConversation: async (
    listingId: string,
    renterId: string,
    ownerId: string,
  ) => {
    await db
      .insert(conversations)
      .values({ listing_id: listingId, renter_id: renterId, owner_id: ownerId, booking_id: null })
      .onConflictDoNothing(); // partial unique index handles deduplication

    return db.query.conversations.findFirst({
      where: and(
        eq(conversations.listing_id, listingId),
        eq(conversations.renter_id, renterId),
        isNull(conversations.booking_id),
      ),
    });
  },

  findInquiryConversation: async (listingId: string, renterId: string) => {
    return db.query.conversations.findFirst({
      where: and(
        eq(conversations.listing_id, listingId),
        eq(conversations.renter_id, renterId),
        isNull(conversations.booking_id),
      ),
    });
  },

  /**
   * Called immediately after a booking is created.
   *
   * Strategy:
   *   1. If an inquiry thread exists for the (listing, renter) pair,
   *      upgrade it by setting booking_id — it becomes the booking thread.
   *   2. Otherwise, create a new conversation with booking_id already set.
   *
   * Returns the conversation that is now linked to the booking.
   */
  attachOrCreateConversation: async (
    bookingId: string,
    listingId: string,
    renterId: string,
    ownerId: string,
  ) => {
    // Check for an existing inquiry thread
    const inquiryThread = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.listing_id, listingId),
        eq(conversations.renter_id, renterId),
        isNull(conversations.booking_id),
      ),
    });

    if (inquiryThread) {
      // Upgrade: attach the booking to the existing inquiry thread
      const [updated] = await db
        .update(conversations)
        .set({ booking_id: bookingId, updated_at: new Date() })
        .where(eq(conversations.id, inquiryThread.id))
        .returning();
      return updated;
    }

    // No prior inquiry thread — create a fresh booking thread
    const [created] = await db
      .insert(conversations)
      .values({ listing_id: listingId, renter_id: renterId, owner_id: ownerId, booking_id: bookingId })
      .returning();
    return created;
  },

  findConversationById: async (conversationId: string) => {
    return db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });
  },

  findConversationByBookingId: async (bookingId: string) => {
    return db.query.conversations.findFirst({
      where: eq(conversations.booking_id, bookingId),
    });
  },

  /**
   * Lists all conversations for a user, enriched with:
   *   - listing title + primary photo
   *   - renter & owner display name + avatar
   *   - linked booking status (used to derive phase client-side)
   *   - last message preview
   *   - unread count
   */
  listConversationsForUser: async (userId: string) => {
    const convs = await db
      .select({
        // Core conversation fields
        id:         conversations.id,
        listing_id: conversations.listing_id,
        renter_id:  conversations.renter_id,
        owner_id:   conversations.owner_id,
        booking_id: conversations.booking_id,
        created_at: conversations.created_at,
        updated_at: conversations.updated_at,

        // Listing snapshot
        listing_title:      listings.title,
        listing_daily_rate: listings.daily_rate,

        // Booking snapshot (NULL when inquiry thread)
        booking_status:       bookings.status,
        booking_start_date:   bookings.start_date,
        booking_end_date:     bookings.end_date,
        booking_total_amount: bookings.total_amount,

        // Renter identity (aliased join)
        renter_display_name: renterUser.display_name,
        renter_avatar_url:   renterUser.avatar_url,

        // Owner identity (aliased join)
        owner_display_name: ownerUser.display_name,
        owner_avatar_url:   ownerUser.avatar_url,

        // Primary listing photo
        listing_photo_url: listingPhotos.url,
      })
      .from(conversations)
      .innerJoin(listings,    eq(conversations.listing_id, listings.id))
      .leftJoin(bookings,     eq(conversations.booking_id, bookings.id))
      .leftJoin(renterUser,   eq(conversations.renter_id,  renterUser.id))
      .leftJoin(ownerUser,    eq(conversations.owner_id,   ownerUser.id))
      .leftJoin(
        listingPhotos,
        and(
          eq(listingPhotos.listing_id, conversations.listing_id),
          eq(listingPhotos.is_primary, true),
          isNull(listingPhotos.deleted_at),
        ),
      )
      .where(or(eq(conversations.renter_id, userId), eq(conversations.owner_id, userId)))
      .orderBy(desc(conversations.updated_at));

    if (convs.length === 0) return [];

    const convIds = convs.map((c) => c.id);

    // Batch fetch last messages using distinct on (conversation_id)
    const lastMessages = await db
      .selectDistinctOn([messages.conversation_id], {
        id: messages.id,
        conversation_id: messages.conversation_id,
        sender_id: messages.sender_id,
        body: messages.body,
        created_at: messages.created_at,
        delivered_at: messages.delivered_at,
        read_at: messages.read_at,
        deleted_at: messages.deleted_at,
      })
      .from(messages)
      .where(and(inArray(messages.conversation_id, convIds), isNull(messages.deleted_at)))
      .orderBy(messages.conversation_id, desc(messages.created_at));

    // Batch fetch unread counts
    const unreadCounts = await db
      .select({
        conversation_id: messages.conversation_id,
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .where(
        and(
          inArray(messages.conversation_id, convIds),
          ne(messages.sender_id, userId),
          isNull(messages.read_at),
          isNull(messages.deleted_at),
        ),
      )
      .groupBy(messages.conversation_id);

    const msgMap = new Map(lastMessages.map((m) => [m.conversation_id, m]));
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversation_id, u.count]));

    return convs.map((conv) => ({
      ...conv,
      phase: derivePhase(conv.booking_status),
      last_message: msgMap.get(conv.id) ?? null,
      unread_count: unreadMap.get(conv.id) ?? 0,
      viewer_role: conv.renter_id === userId ? 'renter' : 'lender',
    }));
  },

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------

  getMessages: async (conversationId: string, limit: number, offset: number) => {
    return db
      .select()
      .from(messages)
      .where(and(eq(messages.conversation_id, conversationId), isNull(messages.deleted_at)))
      .orderBy(asc(messages.created_at))
      .limit(limit)
      .offset(offset);
  },

  addMessage: async (conversationId: string, senderId: string, body: string) => {
    const [inserted] = await db
      .insert(messages)
      .values({ conversation_id: conversationId, sender_id: senderId, body })
      .returning();

    // Keep conversation updated_at current so the inbox sorts correctly
    await db
      .update(conversations)
      .set({ updated_at: new Date() })
      .where(eq(conversations.id, conversationId));

    return inserted;
  },

  markConversationRead: async (conversationId: string, userId: string) => {
    return db
      .update(messages)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          ne(messages.sender_id, userId),
          isNull(messages.read_at),
          isNull(messages.deleted_at),
        ),
      );
  },

  markDelivered: async (messageId: string, deliveredAt: Date) => {
    const [row] = await db
      .update(messages)
      .set({ delivered_at: deliveredAt })
      .where(and(eq(messages.id, messageId), isNull(messages.delivered_at)))
      .returning();
    return row ?? null;
  },

  markUndeliveredAsDelivered: async (conversationId: string, recipientId: string) => {
    const deliveredAt = new Date();
    await db
      .update(messages)
      .set({ delivered_at: deliveredAt })
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          ne(messages.sender_id, recipientId),
          isNull(messages.delivered_at),
          isNull(messages.deleted_at),
        ),
      );
    return deliveredAt;
  },

  softDeleteMessage: async (messageId: string, userId: string) => {
    const [updated] = await db
      .update(messages)
      .set({ deleted_at: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.sender_id, userId)))
      .returning();
    return updated ?? null;
  },
};
