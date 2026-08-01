import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

async function forwardRequest(req: NextRequest, path: string[]) {
  const { getToken } = await auth();
  const token = await getToken();

  const targetUrl = new URL(`${API_BASE_URL}/${path.map((segment) => encodeURIComponent(segment)).join('/')}`);
  targetUrl.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody ? await req.text() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: req.signal,
      // @ts-expect-error undici supports duplex for streamed requests
      duplex: hasBody ? 'half' : undefined,
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response('Proxy unavailable', { status: 503 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(req, path);
}
