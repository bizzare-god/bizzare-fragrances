import type { Metadata } from 'next';
import { FaqView } from '@/components/store/FaqView';

export const metadata: Metadata = {
  title: 'FAQ - Perfume Delivery, Longevity & Paystack Questions | Bizzare Fragrances',
  description:
    'Bizzare (Bizarre) Fragrances FAQ: delivery timelines across Nigeria, fragrance concentration & longevity, sold-out editions, Paystack payment security, authenticity and returns.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return <FaqView />;
}