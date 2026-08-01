import { createClerkClient } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { closePool, db } from '../../src/infra/db/client.js';
import { users } from '../schema.js';
import { demoUsers } from './users.js';

const password = process.env.DEMO_ACCOUNT_PASSWORD || 'Stufluxpass00*';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo accounts cannot be provisioned in production.');
  }
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required to provision demo accounts.');
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  for (const demoUser of demoUsers) {
    const result = await clerk.users.getUserList({ emailAddress: [demoUser.email] });
    const clerkUser = result.data[0] ?? await clerk.users.createUser({
      emailAddress: [demoUser.email],
      password,
      firstName: demoUser.first_name,
      lastName: demoUser.last_name,
      skipPasswordChecks: true,
    });

    // Keep the existing database UUID intact so all seeded bookings and messages remain connected.
    await db.update(users)
      .set({ clerk_user_id: clerkUser.id, email: demoUser.email, avatar_url: demoUser.avatar_url })
      .where(eq(users.display_name, demoUser.display_name));
    console.log(`✓ ${demoUser.display_name}: ${demoUser.email}`);
  }
  console.log(`Demo password: ${password}`);
}

main()
  .catch((error) => {
    console.error('Demo account provisioning failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => closePool());
