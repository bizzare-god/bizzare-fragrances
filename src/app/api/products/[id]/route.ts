import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { recordAuditLog } from '@/lib/audit';
import { invalidateProductCache } from '@/lib/cache';

async function canManageProduct(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || !hasRole(user.role, [UserRole.ADMIN])) return null;
  return user;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    // Protect inactive products from public inspection
    if (!product.isActive) {
      const user = await getSessionUser(request);
      const isAdmin = user && user.role === UserRole.ADMIN;
      if (!isAdmin) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }
    }

    return NextResponse.json({ product: productDto(product) });
  } catch {
    return NextResponse.json({ error: 'Unable to load the product.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await canManageProduct(request);
    if (!user) return NextResponse.json({ error: 'Only boutique administrators can edit fragrances.' }, { status: 403 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.brand === 'string' && body.brand.trim()) updates.brand = body.brand.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.scent_family === 'string') updates.scentFamily = body.scent_family;
    if (Number.isInteger(body.volume_ml) && body.volume_ml > 0) updates.volumeMl = body.volume_ml;
    if (Array.isArray(body.top_notes)) updates.topNotes = body.top_notes.map(String);
    if (Array.isArray(body.middle_notes)) updates.middleNotes = body.middle_notes.map(String);
    if (Array.isArray(body.base_notes)) updates.baseNotes = body.base_notes.map(String);
    if (Number.isFinite(body.price) && body.price > 0) updates.price = body.price;
    if (Number.isInteger(body.stock) && body.stock >= 0) updates.stock = body.stock;
    if (typeof body.is_active === 'boolean') updates.isActive = body.is_active;
    if (typeof body.image_url === 'string' && body.image_url.trim().length > 0) {
      updates.images = [body.image_url.trim()];
    }

    if (typeof body.category === 'string' && body.category.trim()) {
      const cat = await prisma.category.upsert({
        where: { name: body.category.trim() },
        create: { name: body.category.trim() },
        update: {},
      });
      updates.categoryId = cat.id;
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: updates,
      include: { category: true },
    });

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'UPDATE_PRODUCT',
      targetType: 'Product',
      targetId: product.id,
      details: updates,
    });

    invalidateProductCache();

    return NextResponse.json({ product: productDto(product) });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Unable to update the product.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await canManageProduct(request);
    if (!user) return NextResponse.json({ error: 'Only boutique administrators can remove fragrances.' }, { status: 403 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    await prisma.product.update({ where: { id: existing.id }, data: { isActive: false } });

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'DEACTIVATE_PRODUCT',
      targetType: 'Product',
      targetId: existing.id,
    });

    invalidateProductCache();

    return NextResponse.json({ message: 'Product deactivated in the boutique.' });
  } catch {
    return NextResponse.json({ error: 'Unable to remove the product.' }, { status: 500 });
  }
}
