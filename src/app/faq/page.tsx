import type { Metadata } from 'next';
import { FaqView } from '@/components/store/FaqView';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'FAQ — Perfume Delivery, Authenticity & Orders in Nigeria | Bizzare Fragrances',
  description:
    'Frequently asked questions about Bizzare Fragrances: 100% genuine imported perfumes, express delivery timelines across Lagos & Nigeria, Flutterwave payment security, concentrations and returns.',
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    title: 'Bizzare Fragrances FAQ — Perfume Delivery, Authenticity & Orders in Nigeria',
    description:
      'Answers to common questions about authentic imported perfumes, delivery across Nigeria, payment security, and boutique concierge orders.',
    url: 'https://bizzarefragrances.shop/faq',
    siteName: 'Bizzare Fragrances',
    images: [{ url: '/og-logo.png', width: 412, height: 362, alt: 'Bizzare Fragrances FAQ' }],
  },
};

export default function FaqPage() {
  return <FaqView />;
}