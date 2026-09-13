import type { Metadata } from 'next';
import { CustomerServiceView } from '@/components/store/CustomerServiceView';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Bizzare Fragrances Customer Service & Perfume Consultation',
  description:
    'Contact Bizzare Fragrances customer service for order inquiries, delivery updates, bespoke fragrance consultations and concierge support across Nigeria. Call +234 911 474 3607 or chat on WhatsApp.',
  alternates: { canonical: '/customer-service' },
  openGraph: {
    type: 'website',
    title: 'Bizzare Fragrances Customer Service & Perfume Consultation',
    description:
      'Contact Bizzare Fragrances customer service for order inquiries, delivery updates, bespoke fragrance consultations and concierge support in Nigeria.',
    url: 'https://bizzarefragrances.shop/customer-service',
    siteName: 'Bizzare Fragrances',
    images: [{ url: '/og-logo.png', width: 412, height: 362, alt: 'Bizzare Fragrances Customer Service' }],
  },
};

export default function CustomerServicePage() {
  return <CustomerServiceView />;
}