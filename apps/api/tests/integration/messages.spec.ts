import request from 'supertest';
import EventSource from 'eventsource';
import { jest, describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { authHeader } from '../helpers/auth.js';
import { resetDb, createUser, createCategory, createListing, createConversation, createMessage, findMessages, findMessageById } from '../helpers/db.js';

// Mock Clerk + user sync to avoid network calls
jest.unstable_mockModule('@clerk/backend', () => ({
  verifyToken: jest.fn(async (token: string) => ({
    sub: token,
    sid: `${token}-sid`,
  })),
  createClerkClient: jest.fn(() => ({
    users: { getUser: jest.fn() },
  })),
}));

jest.unstable_mockModule('../../src/modules/users/service.js', () => ({
  ensureUserSynced: jest.fn(),
  getProfile: jest.fn(async () => null),
  updateProfile: jest.fn(async () => null),
}));

// Import app after mocks are registered
const { default: app } = await import('../../src/main/app.js');
const { closePool } = await import('../../db/index.js');

// Allow global cleanup for server/pool to avoid open handles
let globalServer: any;

describe('Messaging HTTP flows', () => {
  let categoryId: number;
  let ownerId: string;
  let renterId: string;
  let listingId: string;

  beforeAll(async () => {
    await resetDb();
  });

  beforeEach(async () => {
    await resetDb();
    const category = await createCategory();
    categoryId = category.id;
    const owner = await createUser({ display_name: 'Owner' });
    const renter = await createUser({ display_name: 'Renter' });
    ownerId = owner.id;
    renterId = renter.id;
    const listing = await createListing(ownerId, categoryId);
    listingId = listing.id;
  });

  it('creates a message for a new conversation', async () => {
    const res = await request(app)
      .post('/api/v1/messages')
      .set(authHeader(renterId))
      .send({ listing_id: listingId, body: 'Hi there' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ body: 'Hi there', sender_id: renterId, conversation_id: expect.any(String) });

    const convoRes = await request(app)
      .get('/api/v1/conversations')
      .set(authHeader(ownerId));

    expect(convoRes.status).toBe(200);
    const [convo] = convoRes.body.data;
    expect(convo).toMatchObject({ listing_id: listingId, renter_id: renterId, owner_id: ownerId });
    expect(convo.last_message?.body).toBe('Hi there');
    expect(convo.unread_count).toBe(1);
  });

  it('lists messages and marks them read for the viewer', async () => {
    const convo = await createConversation(listingId, renterId, ownerId);
    await createMessage(convo.id, renterId, 'First');
    await createMessage(convo.id, renterId, 'Second');

    const res = await request(app)
      .get(`/api/v1/conversations/${convo.id}/messages`)
      .set(authHeader(ownerId));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);

    const dbMsgs = await findMessages(convo.id);
    dbMsgs
      .filter((m) => m.sender_id !== ownerId)
      .forEach((m) => {
        expect(m.read_at).not.toBeNull();
      });
  });

  it('marks conversation seen explicitly', async () => {
    const convo = await createConversation(listingId, renterId, ownerId);
    await createMessage(convo.id, renterId, 'Ping');

    const res = await request(app)
      .post(`/api/v1/conversations/${convo.id}/seen`)
      .set(authHeader(ownerId));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ conversation_id: convo.id, status: 'seen' });

    const msgs = await findMessages(convo.id);
    expect(msgs.every((m) => m.read_at !== null || m.sender_id === ownerId)).toBe(true);
  });

  it('soft deletes own message and hides it from fetches', async () => {
    const convo = await createConversation(listingId, renterId, ownerId);
    const msg = await createMessage(convo.id, renterId, 'To delete');

    const delRes = await request(app)
      .delete(`/api/v1/messages/${msg.id}`)
      .set(authHeader(renterId));

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.deleted_at).not.toBeNull();

    const listRes = await request(app)
      .get(`/api/v1/conversations/${convo.id}/messages`)
      .set(authHeader(ownerId));

    expect(listRes.status).toBe(200);
    const bodies = listRes.body.data.map((m: any) => m.body);
    expect(bodies).not.toContain('To delete');
  });

  it('forbids non-participants from accessing messages', async () => {
    const convo = await createConversation(listingId, renterId, ownerId);
    await createMessage(convo.id, renterId, 'Secret');
    const outsider = (await createUser({ display_name: 'Intruder' })).id;

    const res = await request(app)
      .get(`/api/v1/conversations/${convo.id}/messages`)
      .set(authHeader(outsider));

    expect(res.status).toBe(403);
  });

  
});

describe('Messaging SSE flows', () => {
  let baseUrl: string;
  let categoryId: number;
  let ownerId: string;
  let renterId: string;
  let listingId: string;
  let conversationId: string;

  beforeAll(async () => {
    await resetDb();
    globalServer = app.listen(0);
    const address = globalServer.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    await resetDb();
    const category = await createCategory();
    categoryId = category.id;
    const owner = await createUser({ display_name: 'Owner' });
    const renter = await createUser({ display_name: 'Renter' });
    ownerId = owner.id;
    renterId = renter.id;
    const listing = await createListing(ownerId, categoryId);
    listingId = listing.id;
    const convo = await createConversation(listingId, renterId, ownerId);
    conversationId = convo.id;
  });

  afterAll(async () => {
    await closePool();    
    globalServer?.close();
  });
  

  it('pushes new messages over SSE to connected participant', async () => {
    const stream = new EventSource(`${baseUrl}/api/v1/conversations/${conversationId}/stream`, {
      headers: authHeader(ownerId),
    });

    const received = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('No SSE payload received')), 5000);
      stream.onmessage = (event) => {
        clearTimeout(timer);
        stream.close();
        resolve(JSON.parse(event.data));
      };
      stream.onerror = (err) => {
        clearTimeout(timer);
        stream.close();
        reject(err);
      };
    });

    await request(baseUrl)
      .post('/api/v1/messages')
      .set(authHeader(renterId))
      .send({ conversation_id: conversationId, body: 'Live hello' });

    const payload: any = await received;
    expect(payload.body).toBe('Live hello');
    expect(payload.sender_id).toBe(renterId);
    expect(payload.conversation_id).toBe(conversationId);
    expect(payload.delivered_at).toBeTruthy();

    const dbMsg = await findMessageById(payload.id);
    expect(dbMsg?.delivered_at).not.toBeNull();
  });

  it('retroactively marks delivered_at when receiver connects after messages were sent', async () => {
    const msg = await createMessage(conversationId, renterId, 'Offline hello');

    const stream = new EventSource(`${baseUrl}/api/v1/conversations/${conversationId}/stream`, {
      headers: authHeader(ownerId),
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('No connect')), 3000);
      stream.onopen = () => {
        clearTimeout(timer);
        resolve(null);
      };
      stream.onerror = reject;
    });

    const dbMsg = await findMessageById(msg.id);
    expect(dbMsg?.delivered_at).not.toBeNull();

    stream.close();
  });
});
