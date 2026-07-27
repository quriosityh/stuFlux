import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  const apiUrl = `${process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1'}/notifications/stream`;
  const upstream = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: req.signal,
  });

  if (!upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
