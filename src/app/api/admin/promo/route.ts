import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { invalidateProductCache } from '@/lib/cache';

function validateDiscountedPercent(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const pct = Number(value);
  if (!Number.isInteger(pct) || pct < 1 || pct > 99) {
    throw new Error('Store-wide discount percentage must be a whole number between 1 and 99.');
  }
  return pct;
}

function validateEndsAt(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) throw new Error('Provide a valid end date and time for the sale.');
  if (date.getTime() <= Date.now()) {
    throw new Error('The store-wide sale end time must be in the future.');
  }
  return date;
}

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can manage promotions.' }, { status: 403 });
    }

    const promo = await prisma.storePromo.findUnique({ where: { id: 'storewide' } });
    return NextResponse.json({
      promo: promo
        ? {
            discount_percent: promo.discountPercent,
            discount_ends_at: promo.discountEndsAt ? promo.discountEndsAt.toISOString() : null,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in /api/admin/promo GET:', error);
    return NextResponse.json({ error: 'Unable to load the store-wide sale.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can manage promotions.' }, { status: 403 });
    }

    const body = await request.json();

    let discountPercent: number | null = null;
    let discountEndsAt: Date | null = null;
    try {
      discountPercent = validateDiscountedPercent(body.discount_percent);
      discountEndsAt = validateEndsAt(body.discount_ends_at);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid store-wide sale details.' },
        { status: 400 }
      );
    }

    if (discountPercent !== null && discountEndsAt === null) {
      return NextResponse.json(
        { error: 'The store-wide sale requires an end date and time.' },
        { status: 400 }
      );
    }

    const promo = await prisma.storePromo.upsert({
      where: { id: 'storewide' },
      create: { id: 'storewide', discountPercent, discountEndsAt },
      update: { discountPercent, discountEndsAt },
    });

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'UPDATE_STORE_PROMO',
      targetType: 'StorePromo',
      targetId: promo.id,
      details: { discountPercent: promo.discountPercent, discountEndsAt: promo.discountEndsAt },
    });

    invalidateProductCache();

    return NextResponse.json({
      promo: {
        discount_percent: promo.discountPercent,
        discount_ends_at: promo.discountEndsAt ? promo.discountEndsAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error updating store-wide sale:', error);
    return NextResponse.json({ error: 'Unable to update the store-wide sale.' }, { status: 500 });
  }
}