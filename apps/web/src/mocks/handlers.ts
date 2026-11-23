import { rest } from 'msw';

// Helper that returns the same payload for both proxied and non-proxied paths
const categoriesPayload = [
  { id: 1, name: 'Power & Energy', slug: 'power-energy' },
  { id: 2, name: 'Tools & Home Fix', slug: 'tools-home-fix' },
  { id: 3, name: 'Cameras & Creators', slug: 'cameras-creators' },
];

const listingsPayload = [
  {
    id: 'listing-seed-1',
    title: 'Bosch Power Drill',
    daily_rate: 800,
    area: 'LAH-001',
    category: { id: 2, slug: 'tools-home-fix' },
  },
  {
    id: 'listing-seed-2',
    title: 'Canon DSLR Kit',
    daily_rate: 2500,
    area: 'LAH-012',
    category: { id: 3, slug: 'cameras-creators' },
  },
];

export const handlers = [
  // non-proxied endpoints
  rest.get('/api/categories', (req, res, ctx) => res(ctx.status(200), ctx.json(categoriesPayload))),
  rest.get('/api/listings', (req, res, ctx) => res(ctx.status(200), ctx.json(listingsPayload))),

  // proxied endpoints used by client (`/api/proxy/*`)
  rest.get('/api/proxy/categories', (req, res, ctx) => res(ctx.status(200), ctx.json(categoriesPayload))),
  rest.get('/api/proxy/listings', (req, res, ctx) => res(ctx.status(200), ctx.json(listingsPayload))),
];

export default handlers;
