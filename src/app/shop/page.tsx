import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { CollectionView } from '@/components/store/CollectionView';
import { isFamilySlug } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Perfumes in Nigeria',
  description:
    'Browse the full collection of authentic imported perfumes in Nigeria from Bizzare Fragrances. Filter by scent family, price and more with nationwide delivery.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    type: 'website',
    title: 'Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Browse the full collection of authentic imported perfumes in Nigeria from Bizzare Fragrances. Filter by scent family, price and more with nationwide delivery.',
    url: 'https://bizzarefragrances.shop/shop',
    siteName: 'Bizzare Fragrances',
    images: [{ url: '/og-logo.png', width: 412, height: 362, alt: 'Bizzare Fragrances' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perfumes in Nigeria | Bizzare Fragrances',
    description: 'Browse authentic imported perfumes in Nigeria from Bizzare Fragrances.',
    images: ['/og-logo.png'],
  },
};

interface ShopPageProps {
  searchParams: { family?: string; q?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const familyParam = searchParams.family?.toLowerCase();
  if (familyParam && isFamilySlug(familyParam)) {
    redirect(`/perfumes/${familyParam}`);
  }

  const [products, storewide] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    getStorewideSale(),
  ]);
  const initialProducts = products.map((product) => productDto(product, storewide));

  return <CollectionView initialProducts={initialProducts} initialQuery={searchParams.q ?? ''} />;
}