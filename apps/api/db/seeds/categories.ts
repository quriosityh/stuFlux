import { db } from '../../src/infra/db/client.js';
import { categories } from '../schema.js';

const categoriesSeed = [
  { name: 'Power & Energy', slug: 'power-energy', description: 'Generators, UPS units, solar lamps, extension setups, inverters', icon: 'zap' },
  { name: 'Tools & Home Fix', slug: 'tools-home-fix', description: 'Power drills, ladders, pressure washers, paint rollers, tile cutters, measuring equipment', icon: 'wrench' },
  { name: 'Cameras & Creators', slug: 'cameras-creators', description: 'DSLRs, lenses, tripods, ring lights, mics, audio interfaces, gimbal stabilizers, projectors', icon: 'camera' },
  { name: 'Music & Audio', slug: 'music-audio', description: 'Guitars, keyboards, DJ controllers, amps, portable speakers, mics, audio mixers', icon: 'music' },
  { name: 'Clothing & Fashion', slug: 'clothing-fashion', description: 'Sherwani, lehenga, formal suits, cultural dress, accessories, jewellery sets', icon: 'shirt' },
  { name: 'Hosting & Party Essentials', slug: 'hosting-party', description: 'Speakers, projectors, decoration sets, fairy lights, serving dishes, crockery, lawn games', icon: 'party' },
  { name: 'Bikes & Boards', slug: 'bikes-boards', description: 'Bicycles, e-scooters, skateboards, rollerblades, unicycles', icon: 'bike' },
  { name: 'Travel & Outdoors', slug: 'travel-outdoors', description: 'Tents, hiking backpacks, sleeping bags', icon: 'tent' },
];

export async function seedCategories() {
  await db
    .insert(categories)
    .values(categoriesSeed)
    .onConflictDoNothing({ target: categories.slug });
}
