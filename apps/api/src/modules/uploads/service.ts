import { AppError } from '../../common/errors.js';
import { buildUploadSignature, isAllowedMime, isWithinSize } from '../../utils/cloudinary.js';

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

/**
 * Returns a signed Cloudinary upload signature scoped to the user's folder.
 * No listing ID required — photos always land in stuflux/users/{userId}/
 * and are associated with a listing only when POST /listings is called.
 */
export const getUploadSignature = async (userId: string) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const folder = `stuflux/users/${userId}`;
  const signature = buildUploadSignature(folder);

  // IMPORTANT: only return fields that were included in the signature.
  // Adding extra fields here would cause Cloudinary to reject the upload
  // because it re-derives the expected signature from all posted form fields.
  // resource_type, max_files, max_file_size are NOT part of the signed params.
  return {
    upload: {
      timestamp: signature.timestamp,
      folder: signature.folder,
      signature: signature.signature,
      api_key: signature.api_key,
      cloud_name: signature.cloud_name,
    },
  };
};

/**
 * Validates and sanitizes uploaded Cloudinary assets.
 * Returns standardized photo objects ready to be sent in the `photos` field
 * of POST /listings or PUT /listings/:id.
 */
export const completeUpload = async (userId: string, payload: any) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

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
