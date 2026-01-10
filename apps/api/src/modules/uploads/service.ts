import { AppError } from '../../common/errors.js';

export const getUploadSignature = async (userId: string) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  // TODO: implement Cloudinary signature generation
  return {
    message: 'Upload signature endpoint ready - implement Cloudinary integration',
    userId,
    timestamp: new Date().toISOString(),
  };
};

export const completeUpload = async (userId: string, _payload: unknown) => {
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  // TODO: implement upload completion logic
  return {
    message: 'Upload completion endpoint ready',
    userId,
  };
};
