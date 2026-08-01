import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  const upstream = await fetch(`${API_BASE_URL}/conversations/${id}/stream`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-store',
    },
    signal: req.signal,
    // @ts-expect-error undici supports duplex for streamed requests
    duplex: 'half',
  });

  if (!upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
