import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = env.ALLOWED_ORIGINS.map((o) => o.replace(/\/$/, ''));
const allowAll = allowedOrigins.includes('*');

const isPrivateNetworkOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) return true;

    const match = hostname.match(/^172\.(\d{1,3})\./);
    return !!match && Number(match[1]) >= 16 && Number(match[1]) <= 31;
  } catch {
    return false;
  }
};
export const corsConfig = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    // Let a phone on the same Wi-Fi use the development server, without
    // weakening the production CORS policy.
    const isAllowed = allowAll ||
      allowedOrigins.includes(normalizedOrigin) ||
      (env.NODE_ENV !== 'production' && isPrivateNetworkOrigin(normalizedOrigin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
