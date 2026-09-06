import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        phone: user.phone || null,
        role: user.role.toLowerCase(),
        created_at: user.createdAt
          ? (typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString())
          : new Date().toISOString(),
        updated_at: user.updatedAt
          ? (typeof user.updatedAt === 'string' ? user.updatedAt : user.updatedAt.toISOString())
          : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ user: null });
  }
}
