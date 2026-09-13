import type { Metadata } from 'next';
import { HomeView } from '@/components/store/HomeView';
import { getActiveProductsServer } from '@/lib/serverProducts';
import { itemListJsonLd } from '@/lib/seo';

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const metadata: Metadata = {
  title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
  description:
    'Shop 100% original imported perfumes in Nigeria from Bizzare Fragrances. Buy authentic designer, luxury, and niche fragrances directly imported with express nationwide delivery across Lagos, Abuja, and all Nigerian states.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Shop authentic original imported perfumes in Nigeria from Bizzare Fragrances. Designer, luxury, and niche fragrance boutique with nationwide tracked delivery.',
    url: BASE_URL,
    siteName: 'Bizzare Fragrances',
    images: [
      {
        url: '/og-logo.png',
        width: 412,
        height: 362,
        alt: 'Bizzare Fragrances - Original Imported Perfumes in Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Shop authentic original imported perfumes in Nigeria from Bizzare Fragrances. Designer, luxury and niche fragrances with nationwide delivery.',
    images: ['/og-logo.png'],
  },
};

export default async function HomePage() {
  const products = await getActiveProductsServer();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(products.slice(0, 8), BASE_URL)) }}
      />
      <HomeView initialProducts={products} />
    </>
  );
}