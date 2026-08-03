import { listingsRepository } from '../infrastructure/repository.js';
import { categoriesRepository } from '../../categories/repository.js';
import { bookingsRepository } from '../../bookings/repository.js';
import {
  createListingSchema,
  updateListingSchema,
  listFiltersSchema,
  blockedDatesSchema,
  type CreateListingInput,
  type UpdateListingInput,
  type ListFiltersInput,
  type PhotoInput,
} from '../interfaces/validations.js';
import { AppError, ErrorUtils } from '../../../common/errors.js';
import { normalizePhotos, assertPublishable, assertSpecsSize } from '../domain/rules.js';

const MAX_LISTINGS_PER_USER = 10;

export const listListings = async (filters: unknown) => {
  const parsed = listFiltersSchema.parse(filters ?? {});
  const result = await listingsRepository.findAll(parsed);
  return {
    data: result.rows,
    meta: {
      page: parsed.page,
      limit: parsed.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / parsed.limit),
    },
  };
};

export const getListing = async (id: string, options?: { incrementView?: boolean }) => {
  if (!id) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ErrorUtils.notFound('Listing', id);
  if (options?.incrementView !== false) {
    await listingsRepository.incrementViewCount(id);
  }
  return listing;
};

export const getOwnerListings = async (ownerId: string, filters: unknown) => {
  const parsed = listFiltersSchema.parse(filters ?? {});
  const result = await listingsRepository.findByOwner(ownerId, parsed);
  return {
    data: result.rows,
    meta: {
      page: parsed.page,
      limit: parsed.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / parsed.limit),
    },
  };
};

export const createListing = async (payload: unknown, ownerId: string) => {
  const data = createListingSchema.parse(payload);
  assertSpecsSize(data.specs);
  
  // Enforce category exists
  const category = await categoriesRepository.findById(data.category_id);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  await enforceOwnerLimit(ownerId);
  const normalizedPhotos = normalizePhotos(data.photos ?? []);
  if (data.status === 'active') {
    assertPublishable({ ...data, photos: normalizedPhotos });
  }
  const id = await listingsRepository.create({ ...data, ownerId, photos: normalizedPhotos });
  return getListing(id, { incrementView: false });
};

export const updateListing = async (id: string, payload: unknown, ownerId: string) => {
  if (!id) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  const data = updateListingSchema.parse(payload);
  assertSpecsSize(data.specs as any);

  const existing = await listingsRepository.findById(id);
  if (!existing || existing.owner.id !== ownerId) {
    throw ErrorUtils.notFound('Listing', id);
  }

  if (existing.status === 'archived') {
    throw new AppError('Archived listings cannot be modified', 400, 'LISTING_ARCHIVED');
  }

  const nextStatus = data.status ?? existing.status;

  if (nextStatus === 'archived') {
    const hasBookings = await bookingsRepository.hasActiveOrUpcomingConfirmed(id);
    if (hasBookings) {
      throw new AppError(
        'Cannot delete item with active or upcoming bookings',
        400,
        'LISTING_HAS_ACTIVE_BOOKINGS'
      );
    }
  }

  if (nextStatus === 'inactive' && existing.status === 'active') {
    const outOnRental = await bookingsRepository.isCurrentlyOutOnRental(id);
    if (outOnRental) {
      throw new AppError(
        'Cannot pause listing while item is out on rental',
        400,
        'LISTING_OUT_ON_RENTAL'
      );
    }
  }

  const normalizedPhotos = normalizePhotos(data.photos ?? []);

  if (nextStatus === 'active') {
    const snapshot: CreateListingInput = {
      title: existing.title,
      description: existing.description,
      category_id: existing.category?.id ?? data.category_id!,
      daily_rate: existing.daily_rate,
      area: existing.area,
      condition: existing.condition ?? undefined,
      rental_rules: existing.rental_rules ?? undefined,
      specs: (existing.specs as Record<string, unknown>) ?? {},
      min_rental_days: existing.min_rental_days,
      max_rental_days: existing.max_rental_days,
      delivery_available: existing.delivery_available,
      delivery_fee: existing.delivery_fee,
      security_deposit: existing.security_deposit,
      status: nextStatus,
      photos: data.photos ? normalizedPhotos : existing.photos.map((p) => ({
        url: p.url,
        thumbnail_url: p.thumbnail_url ?? undefined,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        size_kb: p.size_kb ?? undefined,
        mime_type: p.mime_type ?? undefined,
        position: p.position ?? undefined,
        is_primary: p.is_primary ?? undefined,
      })),
      ...data,
    };
    assertPublishable({ ...snapshot, photos: snapshot.photos ?? [] });
  }

  const updatedId = await listingsRepository.update(id, ownerId, { ...data, photos: data.photos ? normalizedPhotos : undefined });
  if (!updatedId) throw ErrorUtils.notFound('Listing', id);
  return getListing(updatedId, { incrementView: false });
};

export const getListingBlockedDates = async (listingId: string) => {
  if (!listingId) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  return listingsRepository.getBlockedDates(listingId);
};

export const updateListingBlockedDates = async (
  listingId: string,
  payload: unknown,
  ownerId: string
) => {
  if (!listingId) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');

  const { blocked_dates: blockedDates } = blockedDatesSchema.parse(payload ?? {});

  // Verify ownership
  const existing = await listingsRepository.findByIdForOwner(listingId, ownerId);
  if (!existing) throw ErrorUtils.notFound('Listing', listingId);

  if (existing.status === 'archived') {
    throw new AppError('Archived listings cannot be modified', 400, 'LISTING_ARCHIVED');
  }

  const confirmedBookings = await bookingsRepository.getAvailability(listingId);
  for (const blocked of blockedDates) {
    const overlapsBooking = confirmedBookings.some(
      (booking) => blocked.start_date <= booking.end_date && blocked.end_date >= booking.start_date
    );
    if (overlapsBooking) {
      throw new AppError(
        'Blocked dates cannot overlap confirmed bookings',
        400,
        'BLOCKED_DATES_CONFLICT'
      );
    }
  }

  return listingsRepository.updateBlockedDates(listingId, blockedDates);
};

async function enforceOwnerLimit(ownerId: string) {
  const count = await listingsRepository.countByOwner(ownerId);
  if (count >= MAX_LISTINGS_PER_USER) {
    throw new AppError('Listing limit reached (10)', 400, 'LISTING_LIMIT_REACHED');
  }
}
