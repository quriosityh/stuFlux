import { eq, inArray } from 'drizzle-orm';
import { db } from '../../src/infra/db/client.js';
import { listingPhotos, listings } from '../schema.js';

const listingImages = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
  'https://images.unsplash.com/photo-1525201548942-d8732f6617a0',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
];

const imageUrl = (image: string, width: number) => `${image}?auto=format&fit=crop&q=85&w=${width}&h=${Math.round(width * 0.75)}`;

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
  { slug: 'anker-powerhouse-1', owner_id: '', title: 'Anker Portable Power Station', description: 'Compact battery backup with AC and USB ports for workstations and small events.', category_id: 1, daily_rate: 1400, area: 'model-town', condition: 'like_new', rental_rules: 'Return charged above 50%.', status: 'active', specs: { brand: 'Anker', capacity: '535Wh' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 300, security_deposit: 5000, booking_count: 5, view_count: 119 },
  { slug: 'heavy-duty-extension-kit-1', owner_id: '', title: 'Heavy Duty Extension Kit', description: 'Three weather-safe extension leads with surge protection for events or repairs.', category_id: 1, daily_rate: 350, area: 'cantt', condition: 'good', rental_rules: 'Keep connectors dry.', status: 'active', specs: { length: '25m', outlets: 4 }, min_rental_days: 1, max_rental_days: 10, delivery_available: false, delivery_fee: 0, security_deposit: 1200, booking_count: 7, view_count: 83 },
  { slug: 'aluminium-ladder-1', owner_id: '', title: 'Aluminium Step Ladder', description: 'Six-foot foldable ladder for painting, shelving, and routine home repairs.', category_id: 2, daily_rate: 450, area: 'gulberg', condition: 'good', rental_rules: 'Use on level ground only.', status: 'active', specs: { height: '6ft', material: 'Aluminium' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 250, security_deposit: 1500, booking_count: 9, view_count: 176 },
  { slug: 'tile-cutter-1', owner_id: '', title: 'Manual Tile Cutter', description: 'Clean-cut tile cutter with measuring guide for a weekend renovation.', category_id: 2, daily_rate: 700, area: 'dha-phase-5', condition: 'like_new', rental_rules: 'Ceramic tiles only.', status: 'active', specs: { cutting_length: '600mm' }, min_rental_days: 1, max_rental_days: 4, delivery_available: false, delivery_fee: 0, security_deposit: 2500, booking_count: 4, view_count: 72 },
  { slug: 'sony-a6400-kit-1', owner_id: '', title: 'Sony A6400 Creator Kit', description: 'Mirrorless camera with 16-50mm lens, spare battery, and memory card.', category_id: 3, daily_rate: 3200, area: 'dha-phase-5', condition: 'like_new', rental_rules: 'Keep the sensor cap on while changing lenses.', status: 'active', specs: { brand: 'Sony', model: 'A6400', lens: '16-50mm' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 450, security_deposit: 14000, booking_count: 14, view_count: 405 },
  { slug: 'rode-wireless-go-1', owner_id: '', title: 'Rode Wireless GO II', description: 'Dual-channel wireless microphone set for interviews, reels, and short films.', category_id: 3, daily_rate: 1100, area: 'johar-town', condition: 'like_new', rental_rules: 'Return both transmitters and charging cable.', status: 'active', specs: { brand: 'Rode', channels: 2 }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 250, security_deposit: 4500, booking_count: 10, view_count: 221 },
  { slug: 'casio-keyboard-1', owner_id: '', title: 'Casio CT-S1 Keyboard', description: 'Portable 61-key keyboard with stand and adapter for practice or campus events.', category_id: 4, daily_rate: 1200, area: 'gulberg', condition: 'like_new', rental_rules: 'Use the supplied adapter only.', status: 'active', specs: { keys: 61, includes: 'Stand and adapter' }, min_rental_days: 2, max_rental_days: 10, delivery_available: true, delivery_fee: 300, security_deposit: 4500, booking_count: 6, view_count: 134 },
  { slug: 'focusrite-scarlett-1', owner_id: '', title: 'Focusrite Scarlett Audio Interface', description: 'Two-input USB audio interface for home recording, podcasts, and voiceovers.', category_id: 4, daily_rate: 850, area: 'model-town', condition: 'good', rental_rules: 'Pack in the protective case after use.', status: 'active', specs: { inputs: 2, connection: 'USB-C' }, min_rental_days: 1, max_rental_days: 7, delivery_available: false, delivery_fee: 0, security_deposit: 3000, booking_count: 8, view_count: 166 },
  { slug: 'shure-sm58-pair-1', owner_id: '', title: 'Shure SM58 Microphone Pair', description: 'Two dependable vocal microphones with cables and clips for an event or rehearsal.', category_id: 4, daily_rate: 700, area: 'bahria-town', condition: 'good', rental_rules: 'Do not bend the XLR pins.', status: 'active', specs: { quantity: 2, includes: 'Cables and clips' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 250, security_deposit: 2500, booking_count: 12, view_count: 198 },
  { slug: 'maroon-lehenga-1', owner_id: '', title: 'Maroon Formal Lehenga Set', description: 'Embroidered three-piece formal lehenga with dupatta for a wedding function.', category_id: 5, daily_rate: 3800, area: 'gulberg', condition: 'like_new', rental_rules: 'Dry clean before return.', status: 'active', specs: { size: 'Small/Medium', color: 'Maroon' }, min_rental_days: 2, max_rental_days: 4, delivery_available: true, delivery_fee: 350, security_deposit: 15000, booking_count: 9, view_count: 251 },
  { slug: 'black-tuxedo-1', owner_id: '', title: 'Classic Black Tuxedo', description: 'Tailored tuxedo with shirt and bow tie for formal dinners and university galas.', category_id: 5, daily_rate: 1800, area: 'dha-phase-5', condition: 'like_new', rental_rules: 'No alterations or pinning.', status: 'active', specs: { size: 'Medium', includes: 'Shirt and bow tie' }, min_rental_days: 1, max_rental_days: 3, delivery_available: true, delivery_fee: 250, security_deposit: 7000, booking_count: 6, view_count: 143 },
  { slug: 'bridal-jewellery-set-1', owner_id: '', title: 'Kundan Jewellery Set', description: 'Statement necklace, earrings, and tikka for a bridal or formal look.', category_id: 5, daily_rate: 2200, area: 'model-town', condition: 'like_new', rental_rules: 'Keep in the supplied box when not wearing.', status: 'active', specs: { pieces: 3, finish: 'Gold tone' }, min_rental_days: 1, max_rental_days: 3, delivery_available: false, delivery_fee: 0, security_deposit: 10000, booking_count: 5, view_count: 128 },
  { slug: 'folding-tables-1', owner_id: '', title: 'Folding Table Set for Six', description: 'Six sturdy folding tables for a birthday, dholki, or small corporate setup.', category_id: 6, daily_rate: 1700, area: 'johar-town', condition: 'good', rental_rules: 'Wipe surfaces before return.', status: 'active', specs: { quantity: 6, size: '4ft' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 500, security_deposit: 6000, booking_count: 7, view_count: 187 },
  { slug: 'fairy-light-canopy-1', owner_id: '', title: 'Fairy Light Canopy Set', description: 'Warm white lights and clips for a balcony, mehndi backdrop, or dinner setup.', category_id: 6, daily_rate: 900, area: 'bahria-town', condition: 'like_new', rental_rules: 'Indoor or covered use only.', status: 'active', specs: { length: '30m', color: 'Warm white' }, min_rental_days: 1, max_rental_days: 5, delivery_available: true, delivery_fee: 250, security_deposit: 2500, booking_count: 11, view_count: 212 },
  { slug: 'crockery-set-1', owner_id: '', title: 'White Crockery Set for 24', description: 'Matching dinner plates, bowls, glasses, and serving dishes for twenty-four guests.', category_id: 6, daily_rate: 2000, area: 'cantt', condition: 'good', rental_rules: 'Count all pieces at handover.', status: 'active', specs: { place_settings: 24 }, min_rental_days: 1, max_rental_days: 3, delivery_available: true, delivery_fee: 450, security_deposit: 8000, booking_count: 8, view_count: 174 },
  { slug: 'electric-scooter-1', owner_id: '', title: 'Xiaomi Electric Scooter', description: 'Commuter scooter with helmet and charger for short trips around the city.', category_id: 7, daily_rate: 1400, area: 'dha-phase-5', condition: 'good', rental_rules: 'Stay within Lahore and lock when parked.', status: 'active', specs: { range: '25km', includes: 'Helmet and charger' }, min_rental_days: 1, max_rental_days: 5, delivery_available: false, delivery_fee: 0, security_deposit: 8000, booking_count: 13, view_count: 294 },
  { slug: 'road-bike-1', owner_id: '', title: 'Giant Road Bike', description: 'Lightweight road bike with helmet, lock, and repair kit for training rides.', category_id: 7, daily_rate: 1100, area: 'gulberg', condition: 'good', rental_rules: 'Return tyres inflated and chain clean.', status: 'active', specs: { frame_size: 'Medium', gears: 18 }, min_rental_days: 1, max_rental_days: 7, delivery_available: false, delivery_fee: 0, security_deposit: 5000, booking_count: 7, view_count: 206 },
  { slug: 'kids-bike-1', owner_id: '', title: 'Kids Bicycle with Helmet', description: 'Adjustable children’s bicycle with helmet and training wheels available.', category_id: 7, daily_rate: 400, area: 'model-town', condition: 'good', rental_rules: 'Adult supervision required.', status: 'active', specs: { wheel_size: '20 inch', includes: 'Helmet' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 200, security_deposit: 1500, booking_count: 6, view_count: 97 },
  { slug: 'hiking-backpack-1', owner_id: '', title: '60L Hiking Backpack', description: 'Comfortable framed backpack with rain cover for a weekend trail trip.', category_id: 8, daily_rate: 650, area: 'gulberg', condition: 'good', rental_rules: 'Air out before return.', status: 'active', specs: { capacity: '60L', includes: 'Rain cover' }, min_rental_days: 2, max_rental_days: 14, delivery_available: true, delivery_fee: 250, security_deposit: 2500, booking_count: 8, view_count: 164 },
  { slug: 'sleeping-bag-pair-1', owner_id: '', title: 'Sleeping Bag Pair', description: 'Two warm-weather sleeping bags with compressible carry sacks.', category_id: 8, daily_rate: 500, area: 'dha-phase-5', condition: 'like_new', rental_rules: 'Return dry and zipped.', status: 'active', specs: { quantity: 2, rating: '10C' }, min_rental_days: 2, max_rental_days: 10, delivery_available: true, delivery_fee: 250, security_deposit: 1800, booking_count: 4, view_count: 86 },
  { slug: 'camping-chair-set-1', owner_id: '', title: 'Camping Chair Set for Four', description: 'Four foldable chairs and a compact table for camping or a picnic.', category_id: 8, daily_rate: 800, area: 'johar-town', condition: 'good', rental_rules: 'Brush off dirt before folding.', status: 'active', specs: { chairs: 4, includes: 'Table' }, min_rental_days: 1, max_rental_days: 7, delivery_available: true, delivery_fee: 350, security_deposit: 3000, booking_count: 6, view_count: 111 },
] satisfies (typeof listings.$inferInsert & { slug: string })[];

export async function seedListings(ownerIds: string[]) {
  const existingListings = await db
    .select({ title: listings.title })
    .from(listings)
    .where(inArray(listings.title, listingsSeed.map((listing) => listing.title)));
  const existingTitles = new Set(existingListings.map((listing) => listing.title));
  const missingListings = listingsSeed
    .map(({ slug: _slug, owner_id: _ownerId, ...listing }, index) => ({
      ...listing,
      owner_id: ownerIds[index % ownerIds.length],
    }))
    .filter((listing) => !existingTitles.has(listing.title));
  if (missingListings.length) await db.insert(listings).values(missingListings);

  const seededListings = await db
    .select()
    .from(listings)
    .where(inArray(listings.title, listingsSeed.map((listing) => listing.title)));

  const existingPhotos = await db
    .select({ id: listingPhotos.id, listing_id: listingPhotos.listing_id, url: listingPhotos.url, position: listingPhotos.position })
    .from(listingPhotos)
    .where(inArray(listingPhotos.listing_id, seededListings.map((listing) => listing.id)));
  const listingIdsWithPhotos = new Set(existingPhotos.map((photo) => photo.listing_id));

  // Existing projects may still have the original random picsum fixtures.
  // Replace only those known fixture URLs; never overwrite a user's uploaded photo.
  await Promise.all(existingPhotos
    .filter((photo) => photo.url.includes('picsum.photos'))
    .map((photo) => {
      const listing = seededListings.find((item) => item.id === photo.listing_id)!;
      const index = listingsSeed.findIndex((seed) => seed.title === listing.title) % listingImages.length;
      return db.update(listingPhotos)
        .set({ url: imageUrl(listingImages[index], 1200 - (photo.position ?? 0) * 160), thumbnail_url: imageUrl(listingImages[index], 480) })
        .where(eq(listingPhotos.id, photo.id));
    }));

  const photos = seededListings.flatMap((listing) => {
    if (listingIdsWithPhotos.has(listing.id)) return [];
    const index = listingsSeed.findIndex((seed) => seed.title === listing.title) % listingImages.length;
    const image = listingImages[index];
    return [0, 1, 2].map((position) => ({
      listing_id: listing.id,
      url: imageUrl(image, 1200 - position * 160),
      thumbnail_url: imageUrl(image, 480),
      position,
      is_primary: position === 0,
      is_approved: true,
    }));
  });
  if (photos.length) await db.insert(listingPhotos).values(photos);

  return seededListings;
}
