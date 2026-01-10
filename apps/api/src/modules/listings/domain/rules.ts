import { AppError } from '../../../common/errors.js';
import type { PhotoInput } from '../interfaces/validations.js';

export const MAX_SPECS_SIZE_BYTES = 5_000;

export function normalizePhotos(photos: PhotoInput[]): PhotoInput[] {
  if (!photos || photos.length === 0) return [];
  const trimmed = photos.slice(0, 5);
  let primaryFound = false;
  return trimmed.map((p, index) => {
    const is_primary = primaryFound ? false : p.is_primary ?? index === 0;
    if (is_primary) primaryFound = true;
    return {
      ...p,
      is_primary,
      position: p.position ?? index,
    };
  });
}

export function assertPublishable(data: {
  title?: string;
  description?: string;
  category_id?: number;
  daily_rate?: number;
  city?: string;
  photos?: PhotoInput[];
}) {
  const { title, description, category_id, daily_rate, city, photos } = data;
  if (!title || !description || !category_id || !daily_rate || !city) {
    throw new AppError('Listing is missing required fields to publish', 400, 'PUBLISH_VALIDATION_FAILED');
  }
  if (!photos || photos.length === 0) {
    throw new AppError('At least one photo is required to publish', 400, 'PUBLISH_REQUIRES_PHOTO');
  }
}

export function assertSpecsSize(specs: Record<string, unknown> | undefined) {
  if (!specs) return;
  const size = Buffer.byteLength(JSON.stringify(specs), 'utf8');
  if (size > MAX_SPECS_SIZE_BYTES) {
    throw new AppError('Specs too large', 400, 'SPECS_TOO_LARGE');
  }
}
