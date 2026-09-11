import { prisma } from '@/lib/db';

export type StorewideSale = {
  discountPercent: number | null;
  discountEndsAt: Date | null;
};

export async function getStorewideSale(): Promise<StorewideSale | null> {
  return prisma.storePromo
    .findUnique({ where: { id: 'storewide' } })
    .then((row) =>
      row
        ? {
            discountPercent: row.discountPercent,
            discountEndsAt: row.discountEndsAt,
          }
        : null
    )
    .catch((error) => {
      console.error('Failed to load storewide promo:', error);
      return null;
    });
}