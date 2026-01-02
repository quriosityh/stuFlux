import ky from 'ky';
import { useAuth } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create base client
const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get'],
  },
});

// Hook for authenticated API calls
export function useApiClient() {
  const { getToken } = useAuth();

  const authenticatedClient = apiClient.extend({
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

  return authenticatedClient;
}

// Server-side API client (for Server Components)
export async function createServerApiClient(token?: string) {
  return apiClient.extend({
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