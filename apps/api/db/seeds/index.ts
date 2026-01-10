import { closePool } from '../../src/infra/db/client.js';
import { seedCategories } from './categories.js';

async function main() {
  try {
    await seedCategories();
    console.log('✅ Categories seeded');
  } catch (err) {
    console.error('❌ Seed failed', err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

main();
