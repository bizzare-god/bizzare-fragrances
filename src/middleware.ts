import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'bizzare_fragrances_session';

type MiddlewareSessionPayload = {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  phone?: string | null;
  expiresAt: number;
};

async function verifyToken(token: string | undefined, secret: string): Promise<MiddlewareSessionPayload | null> {
  if (!token || !secret || secret.length < 32) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [bodyB64, signature] = parts;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const computedSig = await crypto.subtle.sign('HMAC', key, enc.encode(bodyB64));
    
    const binary = String.fromCharCode(...new Uint8Array(computedSig));
    const computedB64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (computedB64 !== signature) return null;

    const decodedPayloadStr = atob(bodyB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayloadStr) as MiddlewareSessionPayload;

    if (!payload.userId || typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authSecret = process.env.AUTH_SECRET || '';

  const isProtectedRoute = pathname.startsWith('/admin');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyToken(sessionCookie, authSecret);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
