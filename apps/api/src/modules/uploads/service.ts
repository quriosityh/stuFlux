import { AppError } from '../../common/errors.js';
import { buildUploadSignature, isAllowedMime, isWithinSize } from '../../utils/cloudinary.js';
import { listingsRepository } from '../listings/infrastructure/repository.js';

const MAX_FILES = 5;
const MAX_BYTES = 7 * 1024 * 1024; // 7MB per file

export type UploadedAsset = {
  public_id: string;
  url: string;
  secure_url: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  mime_type?: string;
};

const assertListingOwnedByUser = async (listingId: string, userId: string) => {
  if (!listingId) throw new AppError('Listing id is required', 400, 'LISTING_ID_REQUIRED');
  const listing = await listingsRepository.findByIdForOwner(listingId, userId);
  if (!listing) throw new AppError('Listing not found for user', 404, 'LISTING_NOT_FOUND');
};

export const getUploadSignature = async (userId: string, listingId?: string) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  if (listingId) {
    await assertListingOwnedByUser(listingId, userId);
  }

  const folder = listingId
    ? `stuflux/users/${userId}/listings/${listingId}`
    : `stuflux/users/${userId}/temp`;
  const signature = buildUploadSignature(folder);

  return {
    upload: {
      ...signature,
      folder,
      resource_type: 'image',
      max_files: MAX_FILES,
      max_file_size: MAX_BYTES,
      listing_id: listingId || null,
    },
  };
};

export const completeUpload = async (userId: string, listingId: string | undefined, payload: any) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  if (listingId) {
    await assertListingOwnedByUser(listingId, userId);
  }

  const files: UploadedAsset[] = payload?.files || [];
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError('No files provided', 400, 'UPLOAD_VALIDATION_FAILED');
  }
  if (files.length > MAX_FILES) {
    throw new AppError(`Too many files (max ${MAX_FILES})`, 400, 'UPLOAD_TOO_MANY_FILES');
  }

  const sanitized = files.map((f, idx) => {
    if (!f.public_id || !f.secure_url || typeof f.bytes !== 'number') {
      throw new AppError(`File ${idx + 1} missing required fields`, 400, 'UPLOAD_VALIDATION_FAILED');
    }
    if (!isWithinSize(f.bytes, MAX_BYTES)) {
      throw new AppError(`File ${idx + 1} exceeds size limit`, 400, 'UPLOAD_FILE_TOO_LARGE');
    }
    if (f.mime_type && !isAllowedMime(f.mime_type)) {
      throw new AppError(`File ${idx + 1} mime not allowed`, 400, 'UPLOAD_MIME_NOT_ALLOWED');
    }

    return {
      url: f.secure_url,
      secure_url: f.secure_url,
      width: f.width,
      height: f.height,
      size_kb: Math.ceil(f.bytes / 1024),
      mime_type: f.mime_type,
    };
  });

  return {
    // Use this array directly in listing create/update as the 'photos' field
    // Example: POST /listings { ..., photos: response.files }
    files: sanitized,
  };
};
