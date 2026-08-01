import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { bookings, conversations, messages } from '../schema.js';

const statusReply: Record<string, string> = {
  pending: 'Thanks for the request. I will confirm the handover details shortly.',
  confirmed: 'Confirmed. I have reserved the dates and will message before handover.',
  rejected: 'Sorry, the item is not available for these dates. I have declined the request.',
  cancelled: 'No problem, thanks for letting me know in advance.',
  completed: 'Everything was returned in great condition. Thank you for a smooth rental.',
};

export async function seedConversations(seedBookings: (typeof bookings.$inferSelect)[]) {
  if (!seedBookings.length) return [];
  const bookingIds = seedBookings.map((booking) => booking.id);
  const existing = await db.select().from(conversations).where(inArray(conversations.booking_id, bookingIds));
  const existingBookingIds = new Set(existing.map((conversation) => conversation.booking_id));
  const missing = seedBookings.filter((booking) => !existingBookingIds.has(booking.id));
  if (missing.length) {
    await db.insert(conversations).values(missing.map((booking) => ({
      listing_id: booking.listing_id,
      renter_id: booking.renter_id,
      owner_id: booking.owner_id,
      booking_id: booking.id,
    })));
  }

  const bookingConversations = await db.select().from(conversations).where(inArray(conversations.booking_id, bookingIds));
  const existingMessages = await db.select({ conversation_id: messages.conversation_id }).from(messages)
    .where(inArray(messages.conversation_id, bookingConversations.map((conversation) => conversation.id)));
  const messagedConversationIds = new Set(existingMessages.map((message) => message.conversation_id));
  const bookingById = new Map(seedBookings.map((booking) => [booking.id, booking]));
  const threadMessages = bookingConversations.flatMap((conversation) => {
    if (messagedConversationIds.has(conversation.id)) return [];
    const booking = bookingById.get(conversation.booking_id!);
    if (!booking) return [];
    return [
      { conversation_id: conversation.id, sender_id: booking.renter_id, body: `Hi, ${booking.message ?? 'I would like to rent this item.'}`, delivered_at: new Date('2026-07-28T09:30:00Z'), read_at: new Date('2026-07-28T09:35:00Z') },
      { conversation_id: conversation.id, sender_id: booking.owner_id, body: statusReply[booking.status] ?? 'Thanks for getting in touch.', delivered_at: new Date('2026-07-28T10:00:00Z'), read_at: booking.status === 'pending' ? null : new Date('2026-07-28T10:05:00Z') },
    ];
  });
  if (threadMessages.length) await db.insert(messages).values(threadMessages);

  return bookingConversations;
}

export async function seedInquiryConversations(userIds: string[], listingIds: string[]) {
  const [renterId, ownerId] = [userIds[6], userIds[0]];
  const listingId = listingIds[0];
  const [existing] = await db.select().from(conversations).where(
    and(eq(conversations.listing_id, listingId), eq(conversations.renter_id, renterId), isNull(conversations.booking_id)),
  );
  const conversation = existing ?? (await db.insert(conversations).values({ listing_id: listingId, renter_id: renterId, owner_id: ownerId }).returning())[0];
  const [hasMessages] = await db.select().from(messages).where(eq(messages.conversation_id, conversation.id));
  if (!hasMessages) await db.insert(messages).values([
    { conversation_id: conversation.id, sender_id: renterId, body: 'Hi Ayesha, is the generator quiet enough for an evening study group?', delivered_at: new Date('2026-07-31T15:10:00Z'), read_at: new Date('2026-07-31T15:11:00Z') },
    { conversation_id: conversation.id, sender_id: ownerId, body: 'Yes, it is the inverter model. It works well on a balcony or covered outdoor area.', delivered_at: new Date('2026-07-31T15:12:00Z'), read_at: null },
  ]);
  return conversation;
}
