import { NextRequest, NextResponse } from 'next/server';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const roleMap = {
  buyer: PrismaUserRole.BUYER,
  admin: PrismaUserRole.ADMIN,
} as const;

async function requireAdmin(request: NextRequest) {
  const user = await getSessionUser(request);
  return user?.role === PrismaUserRole.ADMIN ? user : null;
}

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 });
    }
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.name,
        phone: user.phone,
        role: user.role.toLowerCase(),
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load users.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 });

    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const role = typeof body.role === 'string' ? roleMap[body.role as keyof typeof roleMap] : undefined;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Provide a valid user and role.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const previousRole = targetUser.role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await recordAuditLog({
      actorId: admin.id,
      actorName: admin.name,
      action: 'UPDATE_USER_ROLE',
      targetType: 'User',
      targetId: updatedUser.id,
      details: {
        previousRole,
        newRole: updatedUser.role,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role.toLowerCase(),
        created_at: updatedUser.createdAt.toISOString(),
        updated_at: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Unable to update the user role.' }, { status: 500 });
  }
}
