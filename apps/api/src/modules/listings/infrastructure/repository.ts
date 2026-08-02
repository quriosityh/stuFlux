import { db } from '../../../infra/db/client.js';
import { listings, listingPhotos, users, categories, listingBlockedDates, reviews } from '../../../../db/schema.js';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
  isNull,
} from 'drizzle-orm';
import type { CreateListingInput, UpdateListingInput, ListFiltersInput, PhotoInput } from '../interfaces/validations.js';

// A listing is rated by its renters. Owner-to-renter reviews are deliberately
// excluded: they describe the borrower, not the item or its lender.
const listingRatingStats = db
  .select({
    listingId: reviews.listingId,
    rating: sql<number>`round(avg(${reviews.rating})::numeric, 1)`.as('rating'),
    reviewCount: count().as('review_count'),
  })
  .from(reviews)
  .where(and(eq(reviews.role, 'as_lender'), isNull(reviews.deletedAt)))
  .groupBy(reviews.listingId)
  .as('listing_rating_stats');

export const listingsRepository = {
  async countByOwner(ownerId: string) {
    const [row] = await db
      .select({ total: count() })
      .from(listings)
      .where(eq(listings.owner_id, ownerId));
    return Number(row?.total ?? 0);
  },

  async findAll(filters: ListFiltersInput) {
    const { page, limit, sort } = filters;
    const offset = (page - 1) * limit;
    
    const where = buildWhere(filters);
    const orderBy = buildSort(sort);

    const rowsQuery = db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        condition: listings.condition,
        daily_rate: listings.daily_rate,
        area: listings.area,
        status: listings.status,
        view_count: listings.view_count,
        booking_count: listings.booking_count,
        rating: listingRatingStats.rating,
        review_count: listingRatingStats.reviewCount,
        delivery_available: listings.delivery_available,
        created_at: listings.created_at,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
        owner: {
          id: users.id,
          display_name: users.display_name,
          area: users.area,
          avatar_url: users.avatar_url,
        },
        photo: {
          url: listingPhotos.url,
          thumbnail_url: listingPhotos.thumbnail_url,
        },
      })
      .from(listings)
      .leftJoin(categories, eq(categories.id, listings.category_id))
      .leftJoin(users, eq(users.id, listings.owner_id))
      .leftJoin(listingRatingStats, eq(listingRatingStats.listingId, listings.id))
      .leftJoin(
        listingPhotos,
        and(
          eq(listingPhotos.listing_id, listings.id),
          eq(listingPhotos.is_primary, true),
          isNull(listingPhotos.deleted_at)
        )
      )
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ total: count() })
      .from(listings)
      .leftJoin(categories, eq(categories.id, listings.category_id))
      .where(where);

    // Run both queries in parallel — cuts latency roughly in half
    const [rows, [{ total }]] = await Promise.all([rowsQuery, countQuery]);

    return { rows, total: Number(total ?? 0) };
  },




  async findById(id: string) {
    const [row] = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        daily_rate: listings.daily_rate,
        area: listings.area,
        condition: listings.condition,
        rental_rules: listings.rental_rules,
        specs: listings.specs,
        status: listings.status,
        min_rental_days: listings.min_rental_days,
        max_rental_days: listings.max_rental_days,
        delivery_available: listings.delivery_available,
        delivery_fee: listings.delivery_fee,
        security_deposit: listings.security_deposit,
        view_count: listings.view_count,
        rating: listingRatingStats.rating,
        review_count: listingRatingStats.reviewCount,
        created_at: listings.created_at,
        updated_at: listings.updated_at,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
        owner: {
          id: users.id,
          display_name: users.display_name,
          area: users.area,
          avatar_url: users.avatar_url,
          email: users.email,
        },
      })
      .from(listings)
      .leftJoin(categories, eq(categories.id, listings.category_id))
      .leftJoin(users, eq(users.id, listings.owner_id))
      .leftJoin(listingRatingStats, eq(listingRatingStats.listingId, listings.id))
      .where(eq(listings.id, id));

    if (!row) return null;

    const photos = await db
      .select({
        id: listingPhotos.id,
        url: listingPhotos.url,
        thumbnail_url: listingPhotos.thumbnail_url,
        width: listingPhotos.width,
        height: listingPhotos.height,
        size_kb: listingPhotos.size_kb,
        mime_type: listingPhotos.mime_type,
        position: listingPhotos.position,
        is_primary: listingPhotos.is_primary,
      })
      .from(listingPhotos)
      .where(and(eq(listingPhotos.listing_id, id), isNull(listingPhotos.deleted_at)))
      .orderBy(desc(listingPhotos.is_primary), asc(listingPhotos.position), asc(listingPhotos.created_at));

    return { ...row, photos };
  },

  async findByIdForOwner(id: string, ownerId: string) {
    const [row] = await db
      .select({
        id: listings.id,
        owner_id: listings.owner_id,
        status: listings.status,
      })
      .from(listings)
      .where(and(eq(listings.id, id), eq(listings.owner_id, ownerId)));
    return row ?? null;
  },

  async findByOwner(ownerId: string, filters: ListFiltersInput) {
    const { page, limit, sort } = filters;
    const offset = (page - 1) * limit;
    const orderBy = buildSort(sort);

    const rows = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        daily_rate: listings.daily_rate,
        area: listings.area,
        status: listings.status,
        view_count: listings.view_count,
        created_at: listings.created_at,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
        owner: {
          id: users.id,
          display_name: users.display_name,
          area: users.area,
        },
        photo: {
          url: listingPhotos.url,
          thumbnail_url: listingPhotos.thumbnail_url,
        },
      })
      .from(listings)
      .leftJoin(categories, eq(categories.id, listings.category_id))
      .leftJoin(users, eq(users.id, listings.owner_id))
      .leftJoin(
        listingPhotos,
        and(
          eq(listingPhotos.listing_id, listings.id),
          eq(listingPhotos.is_primary, true),
          isNull(listingPhotos.deleted_at)
        )
      )
      .where(eq(listings.owner_id, ownerId))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(listings)
      .where(eq(listings.owner_id, ownerId));

    return { rows, total: Number(total ?? 0) };
  },

  async create(data: CreateListingInput & { ownerId: string; photos: PhotoInput[] }) {
    return db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(listings)
        .values({
          owner_id: data.ownerId,
          title: data.title,
          description: data.description,
          category_id: data.category_id,
          daily_rate: data.daily_rate,
          area: data.area,
          condition: data.condition,
          rental_rules: data.rental_rules,
          specs: data.specs,
          min_rental_days: data.min_rental_days,
          max_rental_days: data.max_rental_days,
          delivery_available: data.delivery_available,
          delivery_fee: data.delivery_fee,
          security_deposit: data.security_deposit,
          status: data.status,
        })
        .returning({ id: listings.id });

      if (data.photos.length > 0) {
        const prepared = preparePhotosForInsert(inserted.id, data.photos);
        if (prepared.length > 0) {
          await tx.insert(listingPhotos).values(prepared);
        }
      }

      return inserted.id;
    });
  },

  async update(id: string, ownerId: string, data: UpdateListingInput & { photos?: PhotoInput[] }) {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(listings)
        .set({
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.category_id && { category_id: data.category_id }),
          ...(data.daily_rate && { daily_rate: data.daily_rate }),
          ...(data.area && { area: data.area }),
          ...(data.condition !== undefined && { condition: data.condition }),
          ...(data.rental_rules !== undefined && { rental_rules: data.rental_rules }),
          ...(data.specs && { specs: data.specs }),
          ...(data.min_rental_days && { min_rental_days: data.min_rental_days }),
          ...(data.max_rental_days && { max_rental_days: data.max_rental_days }),
          ...(data.delivery_available !== undefined && { delivery_available: data.delivery_available }),
          ...(data.delivery_fee !== undefined && { delivery_fee: data.delivery_fee }),
          ...(data.security_deposit !== undefined && { security_deposit: data.security_deposit }),
          ...(data.status && { status: data.status }),
          updated_at: sql`NOW()`
        })
        .where(and(eq(listings.id, id), eq(listings.owner_id, ownerId)))
        .returning({ id: listings.id });

      if (!updated) return null;

      if (data.photos) {
        await tx
          .delete(listingPhotos)
          .where(eq(listingPhotos.listing_id, id));

        const prepared = preparePhotosForInsert(id, data.photos);
        if (prepared.length > 0) {
          await tx.insert(listingPhotos).values(prepared);
        }
      }

      return updated.id;
    });
  },

  async incrementViewCount(id: string) {
    await db
      .update(listings)
      .set({ view_count: sql`${listings.view_count} + 1` })
      .where(eq(listings.id, id));
  },

  async getBlockedDates(listingId: string) {
    return db
      .select({
        id: listingBlockedDates.id,
        listing_id: listingBlockedDates.listing_id,
        start_date: listingBlockedDates.start_date,
        end_date: listingBlockedDates.end_date,
      })
      .from(listingBlockedDates)
      .where(eq(listingBlockedDates.listing_id, listingId));
  },

  async updateBlockedDates(listingId: string, blockedDates: Array<{ start_date: string; end_date: string }>) {
    return db.transaction(async (tx) => {
      await tx
        .delete(listingBlockedDates)
        .where(eq(listingBlockedDates.listing_id, listingId));

      if (blockedDates.length > 0) {
        await tx.insert(listingBlockedDates).values(
          blockedDates.map((d) => ({
            listing_id: listingId,
            start_date: d.start_date,
            end_date: d.end_date,
          }))
        );
      }

      return tx
        .select({
          id: listingBlockedDates.id,
          listing_id: listingBlockedDates.listing_id,
          start_date: listingBlockedDates.start_date,
          end_date: listingBlockedDates.end_date,
        })
        .from(listingBlockedDates)
        .where(eq(listingBlockedDates.listing_id, listingId));
    });
  },
};

function preparePhotosForInsert(listingId: string, photos: PhotoInput[]) {
  if (!photos || photos.length === 0) return [];

  const normalized = [...photos];
  const hasPrimary = normalized.some((p) => p.is_primary);
  if (!hasPrimary) {
    normalized[0] = { ...normalized[0], is_primary: true };
  }

  return normalized.map((p, index) => ({
    listing_id: listingId,
    url: p.url,
    thumbnail_url: p.thumbnail_url,
    width: p.width,
    height: p.height,
    size_kb: p.size_kb,
    mime_type: p.mime_type,
    position: p.position ?? index,
    is_primary: p.is_primary ?? false,
  }));
}

/**
 * Builds a SQL WHERE clause based on the provided listing filters.
 * 
 * @param filters - The listing filter criteria to apply
 * @param filters.q - Optional search query string to match against listing titles (case-insensitive partial match)
 * @param filters.category_id - Optional category ID to filter listings by exact match
 * @param filters.area - Optional area name to filter listings by
 * @param filters.delivery_available - Optional boolean flag to filter listings that offer delivery
 * @param filters.min_rate - Optional minimum daily rate threshold (inclusive)
 * @param filters.max_rate - Optional maximum daily rate threshold (inclusive)
 * 
 * @returns A SQL WHERE clause condition. Always includes an 'active' status filter combined with any additional
 * filter clauses using AND logic. Returns a single condition if only the status filter is applied, or an AND
 * expression combining all applicable conditions. The status is hardcasted to 'any' to bypass type checking.
 * 
 * @remarks
 * - The function dynamically builds the WHERE clause by checking which filters are provided
 * - Only non-empty/truthy filter values are included in the final clause
 * - All string-based searches (title, city) use case-insensitive ILIKE matching with wildcard patterns
 * - Rate filters use numeric comparison operators (gte for minimum, lte for maximum)
 * - The function optimizes the return by avoiding an unnecessary AND wrapper when only one clause exists
 */
function buildWhere(filters: ListFiltersInput) {
  const clauses = [eq(listings.status, 'active' as any)];

  if (filters.q) {
    const like = `%${filters.q}%`;
    // Search title, description, and category name with OR logic
    clauses.push(
      sql`(${listings.title} ILIKE ${like} OR ${listings.description} ILIKE ${like} OR ${categories.name} ILIKE ${like})`
    );
  }
  if (filters.category_id) clauses.push(eq(listings.category_id, filters.category_id));
  if (filters.category) clauses.push(eq(categories.slug, filters.category));
  if (filters.area) clauses.push(eq(listings.area, filters.area));
  if (filters.delivery_available !== undefined) clauses.push(eq(listings.delivery_available, filters.delivery_available));
  if (filters.min_rate) clauses.push(gte(listings.daily_rate, filters.min_rate));
  if (filters.max_rate) clauses.push(lte(listings.daily_rate, filters.max_rate));

  // Exclude listings unavailable for the requested date range.
  // A listing is unavailable if it has a confirmed booking OR a manually blocked
  // date range that overlaps [start_date, end_date].
  // Overlap condition: existing_start <= requested_end AND existing_end >= requested_start
  if (filters.start_date && filters.end_date) {
    clauses.push(
      sql`NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.listing_id = ${listings.id}
          AND bookings.status = 'confirmed'
          AND bookings.start_date <= ${filters.end_date}
          AND bookings.end_date   >= ${filters.start_date}
      )`
    );
    clauses.push(
      sql`NOT EXISTS (
        SELECT 1 FROM listing_blocked_dates
        WHERE listing_blocked_dates.listing_id = ${listings.id}
          AND listing_blocked_dates.start_date <= ${filters.end_date}
          AND listing_blocked_dates.end_date   >= ${filters.start_date}
      )`
    );
  }

  return clauses.length === 1 ? clauses[0]! : and(...clauses);
}

function buildSort(sort: ListFiltersInput['sort']) {
  switch (sort) {
    case 'newest':
      return [desc(listings.created_at)];
    case 'rate_asc':
      return [asc(listings.daily_rate), desc(listings.created_at)];
    case 'rate_desc':
      return [desc(listings.daily_rate), desc(listings.created_at)];
    case 'rating_desc':
      return [
        desc(sql`COALESCE(${listingRatingStats.rating}, 0)`),
        desc(listingRatingStats.reviewCount),
        desc(listings.created_at),
      ];
    case 'popular':
    default:
      return [
        desc(
          sql`(${listings.booking_count} * 3 + ${listings.view_count}) / (EXTRACT(EPOCH FROM (NOW() - ${listings.created_at})) / 86400 + 2)`
        ),
        desc(listings.created_at),
      ];
  }
}
