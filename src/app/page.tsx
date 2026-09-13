import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { HomeView } from '@/components/store/HomeView';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Original Imported Perfumes in Nigeria',
  description:
    'Shop authentic imported perfumes in Nigeria from Bizzare Fragrances. Discover designer, luxury and niche fragrances with nationwide delivery.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Shop authentic imported perfumes in Nigeria from Bizzare Fragrances. Discover designer, luxury and niche fragrances with nationwide delivery.',
    url: 'https://bizzarefragrances.shop/',
    siteName: 'Bizzare Fragrances',
    images: [
      {
        url: '/og-logo.png',
        width: 412,
        height: 362,
        alt: 'Bizzare Fragrances',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Shop authentic imported perfumes in Nigeria from Bizzare Fragrances. Designer, luxury and niche fragrances with nationwide delivery.',
    images: ['/og-logo.png'],
  },
};

export default async function HomePage() {
  const [products, storewide] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    getStorewideSale(),
  ]);
  const initialProducts = products.map((product) => productDto(product, storewide));

  return <HomeView initialProducts={initialProducts} />;
}