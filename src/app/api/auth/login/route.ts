import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError, createSessionResponse } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    if (!authConfigured()) return configurationError();
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const limit = rateLimit(`login:${requestIdentifier(request, email)}`);
    if (!limit.allowed) return NextResponse.json({ error: 'Too many sign-in attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    return createSessionResponse(
      { user: { id: user.id, email: user.email, full_name: user.name, phone: user.phone, role: user.role.toLowerCase() } },
      { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to sign in. Please try again.' }, { status: 500 });
  }
}
