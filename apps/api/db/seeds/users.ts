import { inArray } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { userVerifications, users } from '../schema.js';

export const demoUsers = [
  { clerk_user_id: 'user_dev_001', display_name: 'Ayesha Khan', area: 'gulberg', email: 'ayesha@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=47', first_name: 'Ayesha', last_name: 'Khan' },
  { clerk_user_id: 'user_dev_002', display_name: 'Hamza Ahmed', area: 'dha-phase-5', email: 'hamza@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=12', first_name: 'Hamza', last_name: 'Ahmed' },
  { clerk_user_id: 'user_dev_003', display_name: 'Mahnoor Ali', area: 'johar-town', email: 'mahnoor@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=32', first_name: 'Mahnoor', last_name: 'Ali' },
  { clerk_user_id: 'user_dev_004', display_name: 'Zain Raza', area: 'model-town', email: 'zain@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=11', first_name: 'Zain', last_name: 'Raza' },
  { clerk_user_id: 'user_dev_005', display_name: 'Hira Shah', area: 'bahria-town', email: 'hira@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=45', first_name: 'Hira', last_name: 'Shah' },
  { clerk_user_id: 'user_dev_006', display_name: 'Bilal Siddiqui', area: 'cantt', email: 'bilal@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=13', first_name: 'Bilal', last_name: 'Siddiqui' },
  { clerk_user_id: 'user_dev_007', display_name: 'Sara Iqbal', area: 'walled-city', email: 'sara@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=44', first_name: 'Sara', last_name: 'Iqbal' },
  { clerk_user_id: 'user_dev_008', display_name: 'Omar Farooq', area: 'garden-town', email: 'omar@stuflux.demo', avatar_url: 'https://i.pravatar.cc/300?img=68', first_name: 'Omar', last_name: 'Farooq' },
] as const;

const usersSeed = demoUsers.map(({ first_name: _firstName, last_name: _lastName, ...user }) => user) satisfies (typeof users.$inferInsert)[];

const verificationsSeed = [
  { phone_verified: true, verification_level: 'verified' },
  { phone_verified: true, verification_level: 'verified' },
  { phone_verified: false, verification_level: 'unverified' },
  { phone_verified: true, verification_level: 'verified' },
  { phone_verified: true, verification_level: 'phone_verified' },
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
