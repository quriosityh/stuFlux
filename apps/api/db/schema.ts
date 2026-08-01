import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    jsonb,
    timestamp,
    serial,
    pgEnum,
    date,
    uniqueIndex,
} from "drizzle-orm/pg-core";

// ====================== USERS ======================

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(), // UUID with default random generation
    clerk_user_id: text("clerk_user_id").unique().notNull(), // Clerk-provided ID (must be unique)
    display_name: text("display_name").notNull(), // Required display name
    area: text("area").notNull(), // Required area (Lahore Area ID)
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(), // Auto timestamp
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(), // Auto timestamp


    //  -- Clerk data (synced via webhooks)

    email: text("email"),
    avatar_url: text("avatar_url"),
});

// ====================== USER_VERIFICATIONS ======================
export const userVerifications = pgTable("user_verifications", {
    id: uuid("id").defaultRandom().primaryKey(), // UUID with default random generation
    user_id: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" }) // Foreign key to users(id)
        .notNull(),
    phone_verified: boolean("phone_verified").default(false), // Defaults to false
    verification_level: text("verification_level").default("unverified"), // Default value
});

// ====================== PUSH SUBSCRIPTIONS ======================
export const pushSubscriptions = pgTable("push_subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ====================== CATEGORIES ======================
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    icon: text("icon"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ====================== LISTINGS ======================
export const listings = pgTable("listings", {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: uuid("owner_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category_id: integer("category_id")
        .notNull()
        .references(() => categories.id),
    daily_rate: integer("daily_rate").notNull(),
    area: text("area").notNull(), // Stores Lahore Area ID
    condition: text("condition", { 
        enum: ["like_new", "good", "fair", "well_used"] 
    }),
    rental_rules: text("rental_rules"), // Max 1000 characters
    status: text("status", {
        enum: ["draft", "active", "inactive", "archived"],
    }).default("draft"),
    specs: jsonb("specs").default({}),
    min_rental_days: integer("min_rental_days").default(1),
    max_rental_days: integer("max_rental_days").default(30),
    delivery_available: boolean("delivery_available").default(false),
    delivery_fee: integer("delivery_fee").default(0),
    security_deposit: integer("security_deposit").default(0),
    booking_count: integer("booking_count").default(0),
    view_count: integer("view_count").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ====================== LISTING_BLOCKED_DATES ======================
export const listingBlockedDates = pgTable("listing_blocked_dates", {
    id: uuid("id").defaultRandom().primaryKey(),
    listing_id: uuid("listing_id")
        .notNull()
        .references(() => listings.id, { onDelete: "cascade" }),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ====================== BOOKINGS ======================
export const bookingStatus = pgEnum('booking_status', ['pending', 'confirmed', 'rejected', 'completed', 'cancelled']);

export const bookings = pgTable("bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    listing_id: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    renter_id: uuid("renter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    owner_id: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    total_days: integer("total_days").notNull(),
    total_amount: integer("total_amount").notNull(),
    status: bookingStatus("status").default('pending').notNull(),
    message: text("message"),
    security_deposit: integer("security_deposit").default(0),
    delivery_fee: integer("delivery_fee").default(0),
    confirmed_at: timestamp("confirmed_at", { withTimezone: true }),
    rejected_at: timestamp("rejected_at", { withTimezone: true }),
    cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ====================== LISTING_PHOTOS ======================
export const listingPhotos = pgTable("listing_photos", {
    id: uuid("id").defaultRandom().primaryKey(),
    listing_id: uuid("listing_id")
        .notNull()
        .references(() => listings.id, { onDelete: "cascade" }),

    url: text("url").notNull(),
    thumbnail_url: text("thumbnail_url"),

    width: integer("width"),
    height: integer("height"),
    size_kb: integer("size_kb"),
    mime_type: text("mime_type"),

    position: integer("position").default(0),
    is_primary: boolean("is_primary").default(false),
    is_approved: boolean("is_approved").default(true),

    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

// ====================== CONVERSATIONS ======================
//
// Two thread types:
//   inquiry  — booking_id IS NULL  (renter browsing / chatting before picking dates)
//   booking  — booking_id IS SET   (one conversation per booking, 1:1)
//
// A partial unique index (enforced in migration SQL, not here) guarantees only
// one inquiry thread per (listing_id, renter_id) pair while allowing unlimited
// booking threads for the same pair.
export const conversations = pgTable("conversations", {
    id: uuid("id").defaultRandom().primaryKey(),
    listing_id: uuid("listing_id")
        .notNull()
        .references(() => listings.id, { onDelete: "cascade" }),
    renter_id: uuid("renter_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    owner_id: uuid("owner_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // NULL  → inquiry thread (no booking yet)
    // SET   → booking thread (1:1 with bookings row)
    booking_id: uuid("booking_id")
        .references(() => bookings.id, { onDelete: "set null" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ====================== MESSAGES ======================
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversation_id: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    sender_id: uuid("sender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    delivered_at: timestamp("delivered_at", { withTimezone: true }),
    read_at: timestamp("read_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

// ====================== REVIEWS ======================
// Kept in the database schema so Drizzle Kit can load it directly.
export const reviewRoleEnum = pgEnum('review_role', ['as_lender', 'as_renter']);

export const reviews = pgTable(
    'reviews',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
        listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
        reviewerId: uuid('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        targetId: uuid('target_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        role: reviewRoleEnum('role').notNull(),
        rating: integer('rating').notNull(),
        categoryRatings: jsonb('category_ratings').$type<Record<string, number>>().default({}).notNull(),
        comment: text('comment'),
        anonymous: boolean('anonymous').default(false).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
        deletedAt: timestamp('deleted_at', { withTimezone: true }),
    },
    (table) => ({
        uniqueBookingReviewer: uniqueIndex('uniq_booking_reviewer').on(table.bookingId, table.reviewerId),
    }),
);
