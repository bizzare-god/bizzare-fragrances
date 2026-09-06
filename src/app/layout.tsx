import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop'),
  title: {
    default: 'Bizzare Fragrances (by Bizzare) | Artisanal Luxury Perfumery',
    template: '%s | Bizzare Fragrances (by Bizzare)',
  },
  description: 'Exclusive artisanal luxury perfume collection by Bizzare with secure Paystack checkout, olfactory notes clarity, and concierge support.',
  keywords: [
    'Bizzare Fragrances',
    'Bizzare Fragrance',
    'Haute Parfumerie',
    'Luxury Perfume Nigeria',
    'Oud Extrait',
    'Artisanal Perfume',
    'Niche Fragrances',
  ],
  authors: [{ name: 'Bizzare' }],
  creator: 'Bizzare',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://bizzarefragrances.shop',
    siteName: 'Bizzare Fragrances (by Bizzare)',
    title: 'Bizzare Fragrances (by Bizzare) | Artisanal Luxury Perfumery',
    description: 'Exclusive artisanal luxury perfume collection by Bizzare with secure Paystack checkout and concierge support.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bizzare Fragrances (by Bizzare)',
    description: 'Exclusive artisanal luxury perfume collection by Bizzare.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream-soft text-brown-deep antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
