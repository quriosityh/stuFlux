import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // allow up to 5 min SSE connection

export async function GET(req: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  const apiUrl = `${process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1'}/notifications/stream`;

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-store',
      },
      signal: req.signal,
      // @ts-expect-error — undici/node fetch supports duplex
      duplex: 'half',
    });
  } catch {
    return new Response('Stream unavailable', { status: 503 });
  }

  if (!upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx/proxy buffering
    },
  });
}
