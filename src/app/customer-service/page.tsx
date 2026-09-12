import type { Metadata } from 'next';
import { CustomerServiceView } from '@/components/store/CustomerServiceView';

export const metadata: Metadata = {
  title: 'Customer Service | Perfume Delivery & Support Nigeria',
  description:
    'Contact Bizzare Fragrances customer service for order inquiries, delivery updates, bespoke fragrance consultations and concierge support in Nigeria. Call +234 911 474 3607 or chat on WhatsApp.',
  alternates: { canonical: '/customer-service' },
  openGraph: {
    type: 'website',
    title: 'Customer Service | Perfume Delivery & Support Nigeria',
    description:
      'Contact Bizzare Fragrances customer service for order inquiries, delivery updates, bespoke fragrance consultations and concierge support in Nigeria.',
  },
};

export default function CustomerServicePage() {
  return <CustomerServiceView />;
}