import { listingsRepository } from '../infrastructure/repository.js';
import {
  createListingSchema,
  updateListingSchema,
  listFiltersSchema,
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

export const getListing = async (id: string) => {
  if (!id) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ErrorUtils.notFound('Listing', id);
  await listingsRepository.incrementViewCount(id);
  return listing;
};

export const createListing = async (payload: unknown, ownerId: string) => {
  const data = createListingSchema.parse(payload);
  assertSpecsSize(data.specs);
  await enforceOwnerLimit(ownerId);
  const normalizedPhotos = normalizePhotos(data.photos ?? []);
  if (data.status === 'active') {
    assertPublishable({ ...data, photos: normalizedPhotos });
  }
  const id = await listingsRepository.create({ ...data, ownerId, photos: normalizedPhotos });
  return getListing(id);
};

export const updateListing = async (id: string, payload: unknown, ownerId: string) => {
  if (!id) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  const data = updateListingSchema.parse(payload);
  assertSpecsSize(data.specs as any);

  const existing = await listingsRepository.findByIdForOwner(id, ownerId);
  if (!existing) throw ErrorUtils.notFound('Listing', id);

  if (existing.status === 'archived') {
    throw new AppError('Archived listings cannot be modified', 400, 'LISTING_ARCHIVED');
  }

  const normalizedPhotos = normalizePhotos(data.photos ?? []);

  const nextStatus = data.status ?? existing.status;
  if (nextStatus === 'active') {
    const snapshot: CreateListingInput = {
      ...existing,
      ...data,
      photos: normalizedPhotos,
    } as any;
    assertPublishable({ ...snapshot, photos: normalizedPhotos });
  }

  const updatedId = await listingsRepository.update(id, ownerId, { ...data, photos: data.photos ? normalizedPhotos : undefined });
  if (!updatedId) throw ErrorUtils.notFound('Listing', id);
  return getListing(updatedId);
};

async function enforceOwnerLimit(ownerId: string) {
  const count = await listingsRepository.countByOwner(ownerId);
  if (count >= MAX_LISTINGS_PER_USER) {
    throw new AppError('Listing limit reached (10)', 400, 'LISTING_LIMIT_REACHED');
  }
}
