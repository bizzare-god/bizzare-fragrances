import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { Product } from '@/types';

let cachedProducts: { data: Product[]; expiresAt: number } | null = null;

export async function getActiveProductsServer(): Promise<Product[]> {
  const now = Date.now();
  if (cachedProducts && cachedProducts.expiresAt > now) {
    return cachedProducts.data;
  }

  try {
    const [products, storewide] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      getStorewideSale(),
    ]);

    const dtos = products.map((product) => productDto(product, storewide));
    cachedProducts = { data: dtos, expiresAt: now + 60_000 }; // Cache for 60s
    return dtos;
  } catch (error) {
    console.error('[Server Products] Failed to load products:', error);
    if (cachedProducts) {
      return cachedProducts.data;
    }
    return [];
  }
}
