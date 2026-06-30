import ky from 'ky';
import { useAuth } from '@clerk/nextjs';

// ── Server-side: direct connection (no CORS, runs inside Node.js)
const SERVER_API_URL = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';

// ── Client-side: route through Next.js proxy (/api/proxy/* → Express)
//    This keeps browser requests same-origin so CORS never fires.
const CLIENT_API_URL =
  typeof window !== 'undefined'
    ? '/api/proxy'
    : SERVER_API_URL;

// Base client — used for client-side requests (goes through proxy)
const apiClient = ky.create({
  prefixUrl: CLIENT_API_URL,
  timeout: 10_000,
  retry: { limit: 1, methods: ['get'] },
});

// ── Hook for authenticated client-side API calls
export function useApiClient() {
  const { getToken } = useAuth();

  return apiClient.extend({
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await getToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        },
      ],
    },
  });
}

// ── Server Component API client (direct to Express, no proxy needed)
export async function createServerApiClient(token?: string) {
  const serverClient = ky.create({
    prefixUrl: SERVER_API_URL,
    timeout: 10_000,
    retry: { limit: 1, methods: ['get'] },
  });

  return serverClient.extend({
    hooks: {
      beforeRequest: [
        async (request) => {
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        },
      ],
    },
  });
}

export default apiClient;