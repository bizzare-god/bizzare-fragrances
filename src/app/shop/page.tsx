import type { Metadata } from 'next';
import { CollectionView } from '@/components/store/CollectionView';
import { getActiveProductsServer } from '@/lib/serverProducts';
import { itemListJsonLd } from '@/lib/seo';

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const metadata: Metadata = {
  title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances Collection',
  description:
    'Browse our complete catalogue of 100% authentic original imported perfumes in Nigeria. Filter by woody, floral, oriental, gourmand, fresh, and citrus scent families with express nationwide tracked delivery.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    type: 'website',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Browse the full collection of authentic imported perfumes in Nigeria from Bizzare Fragrances. Filter by scent family, price and more with nationwide delivery.',
    url: `${BASE_URL}/shop`,
    siteName: 'Bizzare Fragrances',
    images: [{ url: '/og-logo.png', width: 412, height: 362, alt: 'Bizzare Fragrances Collection' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description: 'Browse authentic imported perfumes in Nigeria from Bizzare Fragrances with nationwide delivery.',
    images: ['/og-logo.png'],
  },
};

export default async function ShopPage() {
  const products = await getActiveProductsServer();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(products, BASE_URL)) }}
      />
      <CollectionView initialProducts={products} />
    </>
  );
}