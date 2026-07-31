import { db } from '../../src/infra/db/client.js';
import { categories, listingPhotos, listings } from '../schema.js';

const CATEGORY_SLUGS = [
  'power-energy',
  'tools-home-fix',
  'cameras-creators',
  'music-audio',
  'clothing-fashion',
  'hosting-party',
  'bikes-boards',
  'travel-outdoors',
] as const;

const listingsSeed = [
  { slug: 'honda-eu22i-generator-1', owner_id: '', title: 'Honda EU22i Portable Generator', description: 'Quiet petrol generator for backup power during load shedding, events, and outdoor work.', category_id: 1, daily_rate: 2200, area: 'gulberg', condition: 'good', rental_rules: 'Return with the same fuel level. CNIC required at handover.', status: 'active', specs: { brand: 'Honda', model: 'EU22i', output: '2200W' }, min_rental_days: 1, max_rental_days: 14, delivery_available: true, delivery_fee: 400, security_deposit: 8000, booking_count: 6, view_count: 142 },
  { slug: 'solar-inverter-kit-1', owner_id: '', title: '1kW Solar Inverter Kit', description: 'Compact inverter with two solar panels, suitable for a small room setup or a short event.', category_id: 1, daily_rate: 1800, area: 'dha-phase-5', condition: 'like_new', rental_rules: 'Indoor use only. Keep away from water.', status: 'active', specs: { brand: 'Inverex', capacity: '1kW', panels: 2 }, min_rental_days: 2, max_rental_days: 10, delivery_available: true, delivery_fee: 500, security_deposit: 7000, booking_count: 3, view_count: 88 },
  { slug: 'bosch-drill-set-1', owner_id: '', title: 'Bosch Drill Set with Bits', description: 'Reliable cordless drill with a full set of wood, metal, and masonry drill bits.', category_id: 2, daily_rate: 650, area: 'johar-town', condition: 'good', rental_rules: 'Do not use for commercial construction work.', status: 'active', specs: { brand: 'Bosch', voltage: '18V', includes: '24-piece bit set' }, min_rental_days: 1, max_rental_days: 7, delivery_available: false, delivery_fee: 0, security_deposit: 2000, booking_count: 11, view_count: 210 },
  { slug: 'pressure-washer-1', owner_id: '', title: 'Karcher Pressure Washer', description: 'Pressure washer for car cleaning, driveways, and patio washdowns.', category_id: 2, daily_rate: 1200, area: 'model-town', condition: 'good', rental_rules: 'Use clean water only and return all nozzles.', status: 'active', specs: { brand: 'Karcher', pressure: '120 bar', hose_length: '5m' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 350, security_deposit: 4000, booking_count: 5, view_count: 96 },
  { slug: 'canon-eos-200d-1', owner_id: '', title: 'Canon EOS 200D DSLR Camera', description: 'Beginner-friendly DSLR with kit lens, battery, charger, and memory card.', category_id: 3, daily_rate: 2500, area: 'gulberg', condition: 'like_new', rental_rules: 'Keep the camera dry. Lens damage is deducted from deposit.', status: 'active', specs: { brand: 'Canon', model: 'EOS 200D', lens: '18-55mm' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 450, security_deposit: 10000, booking_count: 8, view_count: 312 },
  { slug: 'neewer-ring-light-1', owner_id: '', title: 'Neewer Ring Light with Stand', description: 'Dimmable 18-inch ring light for reels, makeup sessions, and product shoots.', category_id: 3, daily_rate: 500, area: 'bahria-town', condition: 'like_new', rental_rules: 'Pack the stand and power adapter in the supplied bag.', status: 'active', specs: { brand: 'Neewer', diameter: '18 inch', includes: 'phone holder' }, min_rental_days: 1, max_rental_days: 10, delivery_available: false, delivery_fee: 0, security_deposit: 1500, booking_count: 4, view_count: 75 },
  { slug: 'yamaha-acoustic-guitar-1', owner_id: '', title: 'Yamaha Acoustic Guitar', description: 'Warm-sounding acoustic guitar with padded case, tuner, and spare picks.', category_id: 4, daily_rate: 900, area: 'dha-phase-5', condition: 'good', rental_rules: 'Please keep it away from humidity and heat.', status: 'active', specs: { brand: 'Yamaha', type: 'Acoustic', strings: 6 }, min_rental_days: 2, max_rental_days: 14, delivery_available: true, delivery_fee: 300, security_deposit: 3500, booking_count: 2, view_count: 61 },
  { slug: 'jbl-partybox-110-1', owner_id: '', title: 'JBL PartyBox 110 Speaker', description: 'Portable party speaker with deep bass and Bluetooth connectivity for gatherings.', category_id: 4, daily_rate: 1500, area: 'johar-town', condition: 'good', rental_rules: 'No outdoor use in rain. Return fully charged.', status: 'inactive', specs: { brand: 'JBL', model: 'PartyBox 110', battery: '12 hours' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 350, security_deposit: 5000, booking_count: 7, view_count: 180 },
  { slug: 'navy-blue-sherwani-1', owner_id: '', title: 'Navy Blue Embroidered Sherwani', description: 'Classic groom sherwani with matching khussa, ideal for a mehndi or baraat.', category_id: 5, daily_rate: 3000, area: 'model-town', condition: 'like_new', rental_rules: 'Dry clean before return. Alterations are not permitted.', status: 'active', specs: { size: 'Medium', color: 'Navy blue', includes: 'khussa' }, min_rental_days: 2, max_rental_days: 4, delivery_available: true, delivery_fee: 300, security_deposit: 12000, booking_count: 4, view_count: 124 },
  { slug: 'epson-projector-1', owner_id: '', title: 'Epson HD Projector', description: 'Bright HD projector with HDMI cable and portable screen for meetings or movie nights.', category_id: 6, daily_rate: 2000, area: 'gulberg', condition: 'good', rental_rules: 'Use only on a stable surface. Bulb damage is chargeable.', status: 'active', specs: { brand: 'Epson', resolution: '1080p', brightness: '3400 lumens' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 400, security_deposit: 8000, booking_count: 9, view_count: 260 },
  { slug: 'trek-mountain-bike-1', owner_id: '', title: 'Trek Mountain Bike', description: '21-speed mountain bike with helmet and lock for city rides or trail practice.', category_id: 7, daily_rate: 800, area: 'bahria-town', condition: 'fair', rental_rules: 'Helmet use is required. Do not take the bike outside Lahore.', status: 'active', specs: { brand: 'Trek', gears: 21, frame_size: 'Medium' }, min_rental_days: 1, max_rental_days: 10, delivery_available: false, delivery_fee: 0, security_deposit: 3000, booking_count: 12, view_count: 340 },
  { slug: 'four-person-camping-tent-1', owner_id: '', title: 'Four Person Camping Tent', description: 'Water-resistant tent with groundsheet, pegs, and carry bag for weekend trips.', category_id: 8, daily_rate: 1100, area: 'johar-town', condition: 'good', rental_rules: 'Air-dry before packing. Missing pegs are charged separately.', status: 'active', specs: { capacity: 4, material: 'Polyester', waterproof: true }, min_rental_days: 2, max_rental_days: 10, delivery_available: true, delivery_fee: 400, security_deposit: 3500, booking_count: 3, view_count: 109 },
] satisfies (typeof listings.$inferInsert & { slug: string })[];

export async function seedListings(ownerIds: string[]) {
  const seededCategories = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const categoryIdsBySlug = new Map(seededCategories.map((category) => [category.slug, category.id]));

  const insertedListings = await db
    .insert(listings)
    .values(listingsSeed.map(({ slug: _slug, owner_id: _ownerId, category_id, ...listing }, index) => {
      const categorySlug = CATEGORY_SLUGS[category_id - 1];
      const resolvedCategoryId = categorySlug ? categoryIdsBySlug.get(categorySlug) : undefined;
      if (!resolvedCategoryId) {
        throw new Error(`Missing seeded category for listing: ${listing.title}`);
      }

      return {
        ...listing,
        category_id: resolvedCategoryId,
        owner_id: ownerIds[index % ownerIds.length],
      };
    }))
    .returning();

  await db.insert(listingPhotos).values(
    insertedListings.flatMap((listing, index) => {
      const slug = listingsSeed[index].slug;
      return [0, 1, 2].map((position) => ({
        listing_id: listing.id,
        url: `https://picsum.photos/seed/${slug}-${position + 1}/800/600`,
        thumbnail_url: `https://picsum.photos/seed/${slug}-${position + 1}/400/300`,
        position,
        is_primary: position === 0,
        is_approved: true,
      }));
    }),
  );

  return insertedListings;
}
