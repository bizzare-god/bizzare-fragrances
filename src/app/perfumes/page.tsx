import type { Metadata } from 'next';
import Link from 'next/link';
import { FAMILY_NAME, FAMILY_META, breadcrumbJsonLd } from '@/lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Perfume Categories',
  description:
    'Explore our perfume categories - woody, floral, oriental, fresh, gourmand, citrus and aromatic fragrances from Bizzare Fragrances Nigeria.',
  alternates: { canonical: '/perfumes' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/perfumes`,
    title: 'Perfume Categories | Bizzare Fragrances Nigeria',
    description:
      'Explore our perfume categories - woody, floral, oriental, fresh, gourmand, citrus and aromatic fragrances from Bizzare Fragrances Nigeria.',
    siteName: 'Bizzare Fragrances',
    images: [{ url: `${BASE_URL}/og-logo.png`, width: 412, height: 362, alt: 'Bizzare Fragrances' }],
  },
};

export default function PerfumesPage() {
  const categories = (Object.keys(FAMILY_META) as (keyof typeof FAMILY_META)[]).map((key) => ({
    slug: key,
    name: FAMILY_NAME[key],
    meta: FAMILY_META[key],
  }));

  const breadcrumbItems = [
    { name: 'Home', url: `${BASE_URL}/` },
    { name: 'Perfumes', url: `${BASE_URL}/shop` },
    { name: 'Categories', url: `${BASE_URL}/perfumes` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-brown-deep sm:text-3xl md:text-4xl">
            Perfume Categories
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brown-deep/80 sm:text-base">
            Browse authentic imported perfumes in Nigeria by scent family - from rich woody and
            oriental fragrances to fresh, floral, citrus, gourmand and aromatic favourites at
            Bizzare Fragrances.
          </p>
        </header>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/perfumes/${category.slug}`}
                className="block h-full rounded-xl border border-cream-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-card-soft"
              >
                <h2 className="font-serif text-lg font-bold text-brown-deep">
                  {category.meta.title}
                </h2>
                <p className="mt-1.5 text-xs text-brown-deep/70">{category.meta.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}