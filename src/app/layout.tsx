import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop'),
  title: {
    default: 'Bizzare Fragrances (by Bizzare) | Bizarre Perfumes & Fragrances Nigeria',
    template: '%s | Bizzare Fragrances (by Bizzare) - Bizarre Perfumes Nigeria',
  },
  description:
    'Bizzare (Bizarre) Fragrances: 100% authentic imported luxury perfumes with secure Paystack checkout, olfactory notes clarity, express nationwide tracked delivery, and concierge support in Nigeria.',
  keywords: [
    'Bizzare Fragrances',
    'Bizzare Perfumes',
    'Bizarre Fragrances',
    'Bizarre Perfumes',
    'Bizzare Fragrance',
    'Luxury Perfume Nigeria',
    'Niche Fragrances Nigeria',
    'Oud Extrait',
    'Artisanal Perfume',
    'Haute Parfumerie',
  ],
  authors: [{ name: 'Bizzare' }],
  creator: 'Bizzare',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://bizzarefragrances.shop',
    siteName: 'Bizzare Fragrances (by Bizzare)',
    title: 'Bizzare Fragrances (by Bizzare) | Bizarre Perfumes & Fragrances Nigeria',
    description:
      'Bizzare (Bizarre) Fragrances: 100% authentic imported luxury perfumes with secure Paystack checkout and express nationwide delivery in Nigeria.',
    images: [
      {
        url: '/og-logo.png',
        width: 412,
        height: 362,
        alt: 'Bizzare Fragrances (by Bizzare)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bizzare Fragrances (by Bizzare) | Bizarre Perfumes & Fragrances Nigeria',
    description: 'Bizzare (Bizarre) Fragrances: 100% authentic imported luxury perfumes in Nigeria.',
    images: ['/og-logo.png'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Bizzare Fragrances (by Bizzare)',
              url: 'https://bizzarefragrances.shop',
              logo: 'https://bizzarefragrances.shop/og-logo.png',
              sameAs: [
                'https://instagram.com/bizzare_fragrances',
                'https://wa.me/2349114743607',
              ],
            }),
          }}
        />
      </head>
      <body className="bg-cream-soft text-brown-deep antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
