import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { Inter, Playfair_Display } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop'),
  title: {
    default: 'Bizzare Fragrances (by Bizzare) | Bizarre Perfumes & Fragrances Nigeria',
    template: '%s | Bizzare Fragrances (by Bizzare) - Bizarre Perfumes Nigeria',
  },
  description:
    'Bizzare (Bizarre) Fragrances: 100% authentic imported luxury perfumes with secure Flutterwave checkout, olfactory notes clarity, express nationwide tracked delivery, and concierge support in Nigeria.',
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
      'Bizzare (Bizarre) Fragrances: 100% authentic imported luxury perfumes with secure Flutterwave checkout and express nationwide delivery in Nigeria.',
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

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
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
