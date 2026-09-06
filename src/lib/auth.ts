import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { databaseConfigured, prisma } from '@/lib/db';

const COOKIE_NAME = 'bizzare_fragrances_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type SessionPayload = {
  userId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  phone?: string | null;
  expiresAt: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be set to a value of at least 32 characters.');
  return value;
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function decode(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function authConfigured() {
  return databaseConfigured && Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}

export function configurationError() {
  return NextResponse.json({ error: 'Authentication is not configured. Set DATABASE_URL and AUTH_SECRET before using this service.' }, { status: 503 });
}

export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  if (!authConfigured()) return null;
  const payload = decode(request.cookies.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  // Zero-DB instant resolution from cryptographically verified HMAC token
  if (payload.userId && payload.email && payload.role) {
    return {
      id: payload.userId,
      name: payload.name || '',
      email: payload.email,
      phone: payload.phone || null,
      role: payload.role,
    };
  }

  // Fallback for legacy tokens that only stored userId
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
  });
}

export function createSessionResponse(
  body: object,
  user: { id: string; email: string; name: string; role: UserRole; phone?: string | null },
  status = 200
) {
  const response = NextResponse.json(body, { status });
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone || null,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  response.cookies.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionResponse() {
  const response = NextResponse.json({ message: 'Signed out' });
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}

export function hasRole(role: UserRole, allowed: UserRole[]) {
  return allowed.includes(role);
}
