import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
// Disable ALL response buffering in Next.js
export const runtime = 'nodejs';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/conversations/${id}/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      },
      signal: req.signal,
      // Prevent Node.js fetch from buffering the response body
      keepalive: false,
    });
  } catch {
    return new Response('Stream unavailable', { status: 503 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.statusText || 'Stream error', { status: upstream.status });
  }

  // Pipe the upstream SSE body directly to the client with zero buffering.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
      // Nginx: disable proxy buffering
      'X-Accel-Buffering': 'no',
      // Ensure chunks flush immediately
      'Transfer-Encoding': 'identity',
    },
  });
}
