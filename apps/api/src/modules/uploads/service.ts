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

export const getUploadSignature = async (userId: string) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const folder = `stuflux/users/${userId}`;
  const signature = buildUploadSignature(folder);

  return {
    upload: {
      ...signature,
      folder,
      resource_type: 'image',
      max_files: MAX_FILES,
      max_file_size: MAX_BYTES,
    },
  };
};

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
      public_id: f.public_id,
      url: f.url || f.secure_url,
      secure_url: f.secure_url,
      bytes: f.bytes,
      width: f.width,
      height: f.height,
      format: f.format,
      resource_type: f.resource_type || 'image',
      mime_type: f.mime_type,
    } as UploadedAsset;
  });

  return {
    userId,
    files: sanitized,
  };
};
