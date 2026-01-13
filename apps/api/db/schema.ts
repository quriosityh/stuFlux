import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    jsonb,
    timestamp,
    serial,
} from "drizzle-orm/pg-core";

// ====================== USERS ======================
       
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(), // UUID with default random generation
    clerk_user_id: text("clerk_user_id").unique().notNull(), // Clerk-provided ID (must be unique)
    display_name: text("display_name").notNull(), // Required display name
    city: text("city").notNull(), // Required city
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(), // Auto timestamp
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(), // Auto timestamp
        email: text("email"),
        avatar_url: text("avatar_url"),
    
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

    // ====================== BOOKINGS ======================
    export const bookingStatus = pgEnum('booking_status', ['pending', 'confirmed', 'rejected', 'completed']);

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
        completed_at: timestamp("completed_at", { withTimezone: true }),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    });
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
    city: text("city").notNull(),
    address: text("address"),
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
