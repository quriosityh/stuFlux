import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
	secure: true,
});

export type UploadSignature = {
	timestamp: number;
	folder: string;
	signature: string;
	api_key: string;
	cloud_name: string;
};

export const buildUploadSignature = (folder: string): UploadSignature => {
	const timestamp = Math.floor(Date.now() / 1000);

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		env.CLOUDINARY_API_SECRET
	);

	return {
		timestamp,
		folder,
		signature,
		api_key: env.CLOUDINARY_API_KEY,
		cloud_name: env.CLOUDINARY_CLOUD_NAME,
	};
};

export const isAllowedMime = (mime: string | undefined) => {
	if (!mime) return false;
	const allowed = [
		'image/jpeg',
		'image/png',
		'image/webp',
		'image/heic',
		'image/heif',
	];
	return allowed.includes(mime.toLowerCase());
};

export const isWithinSize = (bytes: number | undefined, maxBytes: number) => {
	if (!bytes && bytes !== 0) return false;
	return bytes <= maxBytes;
};

export { cloudinary };
