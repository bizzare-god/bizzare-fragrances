import type { Metadata } from 'next';
import { CollectionView } from '@/components/store/CollectionView';

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

export default function ShopPage() {
  return <CollectionView />;
}