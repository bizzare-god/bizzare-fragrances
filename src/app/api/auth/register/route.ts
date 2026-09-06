import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, createSessionResponse } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    if (!authConfigured()) return configurationError();
    const body = await request.json();
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

    const limit = rateLimit(`register:${requestIdentifier(request, email)}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
      return NextResponse.json(
        { error: 'Provide your name, a valid email, and a password of at least 12 characters.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // All public signups are created as standard client (BUYER) accounts.
    // Elevated roles (VENDOR, COURIER, ADMIN) are exclusively granted by Administrators via /api/admin/users.
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone,
        role: UserRole.BUYER,
        passwordHash,
      },
    });

    return createSessionResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.name,
          phone: user.phone,
          role: user.role.toLowerCase(),
          created_at: user.createdAt.toISOString(),
          updated_at: user.updatedAt.toISOString(),
        },
      },
      { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      201
    );
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    return NextResponse.json({ error: 'Unable to create your account. Please try again.' }, { status: 500 });
  }
}
