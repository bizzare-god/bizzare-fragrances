import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { Inter, Playfair_Display } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop'),
  title: {
    default: 'Bizzare Fragrances | Original Imported Perfumes in Nigeria',
    template: '%s | Bizzare Fragrances',
  },
  description:
    'Shop 100% authentic imported perfumes in Nigeria at Bizzare Fragrances - designer, luxury and niche fragrances with secure checkout, olfactory notes clarity, express nationwide tracked delivery and concierge support.',
  keywords: [
    'Bizzare Fragrances',
    'Bizzare Perfumes',
    'Original Imported Perfumes Nigeria',
    'Luxury Perfume Nigeria',
    'Niche Fragrances Nigeria',
    'Oud Extrait',
    'Artisanal Perfume',
    'Haute Parfumerie',
  ],
  authors: [{ name: 'Bizzare Fragrances' }],
  creator: 'Bizzare Fragrances',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://bizzarefragrances.shop',
    siteName: 'Bizzare Fragrances',
    title: 'Bizzare Fragrances | Original Imported Perfumes in Nigeria',
    description:
      'Shop 100% authentic imported perfumes in Nigeria at Bizzare Fragrances with secure checkout and express nationwide delivery.',
    images: [
      {
        url: '/og-logo.png',
        width: 412,
        height: 362,
        alt: 'Bizzare Fragrances',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bizzare Fragrances | Original Imported Perfumes in Nigeria',
    description: 'Shop 100% authentic imported perfumes in Nigeria at Bizzare Fragrances.',
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
              name: 'Bizzare Fragrances',
              url: 'https://bizzarefragrances.shop',
              logo: 'https://bizzarefragrances.shop/og-logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+2349114743607',
                contactType: 'customer service',
                availableLanguage: 'English',
              },
              sameAs: [
                'https://instagram.com/bizzare_fragrances',
                'https://wa.me/2349114743607',
              ],
            }),
          }}
        />
      </head>
      <body className="bg-cream-soft text-brown-deep antialiased">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LCX4WEH0H4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LCX4WEH0H4');
          `}
        </Script>

        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
