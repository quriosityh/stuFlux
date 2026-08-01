import { inArray } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { userVerifications, users } from '../schema.js';

const usersSeed = [
  { clerk_user_id: 'user_dev_001', display_name: 'Ayesha Khan', area: 'gulberg', email: 'ayesha.khan@example.test', avatar_url: 'https://i.pravatar.cc/300?img=47' },
  { clerk_user_id: 'user_dev_002', display_name: 'Hamza Ahmed', area: 'dha-phase-5', email: 'hamza.ahmed@example.test', avatar_url: 'https://i.pravatar.cc/300?img=12' },
  { clerk_user_id: 'user_dev_003', display_name: 'Mahnoor Ali', area: 'johar-town', email: 'mahnoor.ali@example.test', avatar_url: 'https://i.pravatar.cc/300?img=32' },
  { clerk_user_id: 'user_dev_004', display_name: 'Zain Raza', area: 'model-town', email: 'zain.raza@example.test', avatar_url: 'https://i.pravatar.cc/300?img=11' },
  { clerk_user_id: 'user_dev_005', display_name: 'Hira Shah', area: 'bahria-town', email: 'hira.shah@example.test', avatar_url: 'https://i.pravatar.cc/300?img=45' },
] satisfies (typeof users.$inferInsert)[];

const verificationsSeed = [
  { phone_verified: true, verification_level: 'verified' },
  { phone_verified: true, verification_level: 'verified' },
  { phone_verified: false, verification_level: 'unverified' },
  { phone_verified: true, verification_level: 'phone_verified' },
  { phone_verified: false, verification_level: 'unverified' },
];

export async function seedUsers() {
  const insertedUsers = await db
    .insert(users)
    .values(usersSeed)
    .onConflictDoNothing({ target: users.clerk_user_id })
    .returning();

  if (insertedUsers.length > 0) {
    await db.insert(userVerifications).values(
      insertedUsers.map((user, index) => ({
        user_id: user.id,
        ...verificationsSeed[index],
      })),
    );
  }

  return db
    .select()
    .from(users)
    .where(inArray(users.clerk_user_id, usersSeed.map((user) => user.clerk_user_id)));
}
