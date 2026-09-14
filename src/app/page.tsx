import type { Metadata } from 'next';
import { HomeView } from '@/components/store/HomeView';
import { getActiveProductsServer } from '@/lib/serverProducts';
import { itemListJsonLd } from '@/lib/seo';

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const metadata: Metadata = {
  title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
  description:
    'Shop original imported perfumes in Nigeria from Bizzare Fragrances. Discover designer, niche and luxury fragrances sourced from France, Italy, the UAE and the UK with nationwide delivery.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Original Imported Perfumes in Nigeria | Bizzare Fragrances',
    description:
      'Discover original designer, niche and luxury fragrances from Bizzare Fragrances. Nationwide delivery across Nigeria.',
    url: 'https://bizzarefragrances.shop/',
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
      'Shop original imported perfumes in Nigeria from Bizzare Fragrances. Discover designer, niche and luxury fragrances sourced from France, Italy, the UAE and the UK with nationwide delivery.',
    images: ['/og-logo.png'],
  },
};

export default async function HomePage() {
  const products = await getActiveProductsServer();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bizzare Fragrances',
    url: 'https://bizzarefragrances.shop',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bizzarefragrances.shop/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd(products.slice(0, 8), BASE_URL)),
        }}
      />
      <HomeView initialProducts={products} />
    </>
  );
}