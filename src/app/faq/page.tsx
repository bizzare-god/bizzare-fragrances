import type { Metadata } from 'next';
import { FaqView } from '@/components/store/FaqView';

export const metadata: Metadata = {
  title: 'FAQ - Perfume Delivery, Longevity & Payments Questions | Bizzare Fragrances',
  description:
    'Bizzare (Bizarre) Fragrances FAQ: delivery timelines across Nigeria, fragrance concentration & longevity, sold-out editions, Flutterwave payment security, authenticity and returns.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return <FaqView />;
}