import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { recordAuditLog } from '@/lib/audit';
import { memoryCache, invalidateProductCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    const showAllParam = request.nextUrl.searchParams.get('all') === 'true';

    const user = await getSessionUser(request);
    const canViewAll = Boolean(showAllParam && user && user.role === UserRole.ADMIN);

    // Fast-path for public product list (cache hit in 0.1ms)
    const cacheKey = `public_products_${query || 'all'}`;
    if (!canViewAll) {
      const cached = memoryCache.get<any[]>(cacheKey);
      if (cached) {
        const response = NextResponse.json({ products: cached });
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
        response.headers.set('X-Cache', 'HIT');
        return response;
      }
    }

    const whereClause: Record<string, unknown> = {};
    if (!canViewAll) {
      whereClause.isActive = true;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { scentFamily: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const dtos = products.map(productDto);

    if (!canViewAll) {
      memoryCache.set(cacheKey, dtos, 60_000);
    }

    const response = NextResponse.json({ products: dtos });
    if (!canViewAll && !query) {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    } else {
      response.headers.set('Cache-Control', 'private, no-cache');
    }
    response.headers.set('X-Cache', 'MISS');
    return response;
  } catch (error) {
    console.error('Error in /api/products GET:', error);
    return NextResponse.json({ error: 'Unable to load products.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can add fragrances.' }, { status: 403 });
    }
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const brand = typeof body.brand === 'string' && body.brand.trim() ? body.brand.trim() : 'Bizzare Fragrance';
    const categoryName = typeof body.category === 'string' ? body.category.trim() : '';
    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!name || !brand || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: 'Provide a fragrance name, valid price, and non-negative stock.' },
        { status: 400 }
      );
    }

    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const cat = await prisma.category.upsert({
        where: { name: categoryName },
        create: { name: categoryName },
        update: {},
      });
      categoryId = cat.id;
    }

    const imageUrl =
      typeof body.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : '';
    const images = imageUrl ? [imageUrl] : [];

    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        brand,
        description: typeof body.description === 'string' ? body.description.trim() : '',
        scentFamily: typeof body.scent_family === 'string' ? body.scent_family : 'Other',
        volumeMl: Number(body.volume_ml) || 100,
        topNotes: Array.isArray(body.top_notes) ? body.top_notes.map(String) : [],
        middleNotes: Array.isArray(body.middle_notes) ? body.middle_notes.map(String) : [],
        baseNotes: Array.isArray(body.base_notes) ? body.base_notes.map(String) : [],
        price,
        stock,
        images,
        isActive: true,
      },
      include: { category: true },
    });

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'CREATE_PRODUCT',
      targetType: 'Product',
      targetId: product.id,
      details: { name: product.name, price: Number(product.price), stock: product.stock },
    });

    invalidateProductCache();

    return NextResponse.json({ product: productDto(product) }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/products POST:', error);
    return NextResponse.json({ error: 'Unable to create the product.' }, { status: 500 });
  }
}
