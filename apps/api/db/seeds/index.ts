import { closePool } from '../../src/infra/db/client.js';
import { seedBookings } from './bookings.js';
import { seedCategories } from './categories.js';
import { seedListings } from './listings.js';
import { seedUsers } from './users.js';

async function main() {
  try {
    await seedCategories();
    console.log('✅ Categories seeded');
    const seededUsers = await seedUsers();
    console.log(`✅ ${seededUsers.length} demo users seeded`);
    const seededListings = await seedListings(seededUsers.map((user) => user.id));
    console.log(`✅ ${seededListings.length} demo listings seeded`);
    const seededBookings = await seedBookings(
      seededUsers.map((user) => user.id),
      seededListings.map((listing) => ({
        id: listing.id,
        owner_id: listing.owner_id,
        daily_rate: listing.daily_rate,
      })),
    );
    console.log(`✅ ${seededBookings.length} demo bookings seeded`);
  } catch (err) {
    console.error('❌ Seed failed', err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

main();
