import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { Product } from '@/types';

export async function getActiveProductsServer(): Promise<Product[]> {
  try {
    const [products, storewide] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      getStorewideSale(),
    ]);

    return products.map((product) => productDto(product, storewide));
  } catch (error) {
    console.error('[Server Products] Failed to load products:', error);
    return [];
  }
}
