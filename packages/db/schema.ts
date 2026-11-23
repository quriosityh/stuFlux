import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerk_id: text('clerk_id').unique().notNull(),
  email: text('email'),
  name: text('name'),
  avatar_url: text('avatar_url'),
  city: text('city'),
  phone: text('phone'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  icon: text('icon'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  owner_id: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category_id: integer('category_id').notNull().references(() => categories.id),
  daily_rate: integer('daily_rate').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  status: text('status', { enum: ['draft', 'active', 'inactive', 'archived'] }).default('draft'),
  specs: jsonb('specs').default({}),
  min_rental_days: integer('min_rental_days').default(1),
  max_rental_days: integer('max_rental_days').default(30),
  delivery_available: boolean('delivery_available').default(false),
  delivery_fee: integer('delivery_fee').default(0),
  security_deposit: integer('security_deposit').default(0),
  booking_count: integer('booking_count').default(0),
  view_count: integer('view_count').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
});