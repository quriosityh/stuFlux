import { db, closePool } from '../infra/db/client.js';
import { categories } from '../../db/schema.js';

const categoriesSeed = [
  { name: 'Electronics', slug: 'electronics', description: 'Cameras, laptops, gaming, projectors', icon: 'electronics' },
  { name: 'Tools & Equipment', slug: 'tools-equipment', description: 'Power tools, gardening, construction', icon: 'tools' },
  { name: 'Party & Events', slug: 'party-events', description: 'Tents, speakers, lighting, decor', icon: 'party' },
  { name: 'Sports & Outdoor', slug: 'sports-outdoor', description: 'Camping, bicycles, sports gear', icon: 'sports' },
  { name: 'Home & Furniture', slug: 'home-furniture', description: 'Furniture, appliances, home decor', icon: 'home' },
  { name: 'Other', slug: 'other', description: 'Everything else', icon: 'other' },
];

async function seedCategories() {
  await db
    .insert(categories)
    .values(categoriesSeed)
    .onConflictDoNothing({ target: categories.slug });
}

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
