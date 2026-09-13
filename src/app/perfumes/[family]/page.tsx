import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { CrawlableProductList } from '@/components/seo/CrawlableProductList';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FAMILY_NAME, FAMILY_META, FAMILY_SLUGS, breadcrumbJsonLd, isFamilySlug } from '@/lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const revalidate = 300;

export const dynamicParams = true;

export function generateStaticParams() {
  return FAMILY_SLUGS.map((slug) => ({
    family: slug,
  }));
}

interface FamilyPageProps {
  params: { family: string };
}

export async function generateMetadata({ params }: FamilyPageProps): Promise<Metadata> {
  const slug = params.family.toLowerCase();
  const familyKey = isFamilySlug(slug) ? slug : null;

  if (familyKey) {
    const meta = FAMILY_META[familyKey];
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical: `${BASE_URL}/perfumes/${slug}` },
      openGraph: {
        type: 'website',
        url: `${BASE_URL}/perfumes/${slug}`,
        title: `${meta.title} | Bizzare Fragrances`,
        description: meta.description,
        siteName: 'Bizzare Fragrances',
        images: [{ url: `${BASE_URL}/og-logo.png`, width: 412, height: 362, alt: 'Bizzare Fragrances' }],
      },
    };
  }

  return { title: 'Category Not Found | Bizzare Fragrances' };
}

async function getFamilyProducts(familySlugKey: keyof typeof FAMILY_NAME) {
  try {
    const [products, storewide] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, scentFamily: FAMILY_NAME[familySlugKey] },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      getStorewideSale(),
    ]);
    return products.map((product) => productDto(product, storewide));
  } catch (error) {
    console.error('[Family Page] Failed to load products:', error);
    return [];
  }
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const slug = params.family.toLowerCase();
  const familyKey = isFamilySlug(slug) ? slug : null;
  if (!familyKey) return notFound();

  const meta = FAMILY_META[familyKey];
  const familyName = FAMILY_NAME[familyKey];
  const products = await getFamilyProducts(familyKey);
  const scentFamilies = Object.keys(FAMILY_META) as (keyof typeof FAMILY_META)[];

  const breadcrumbItems = [
    { name: 'Home', url: `${BASE_URL}/` },
    { name: 'Perfumes', url: `${BASE_URL}/shop` },
    { name: `${familyName} Perfumes`, url: `${BASE_URL}/perfumes/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: meta.h1,
              description: meta.description,
              itemListElement: products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: `${product.name} - ${product.brand}`,
                url: `${BASE_URL}/products/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
              })),
            }),
          }}
        />
      )}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-brown-deep sm:text-3xl md:text-4xl">
            {meta.h1}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brown-deep/80 sm:text-base">
            {meta.intro}
          </p>
        </header>
        <div className="mb-8 flex flex-wrap gap-2">
          {scentFamilies.map((key) => (
            <Link
              key={key}
              href={`/perfumes/${key}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                key === familyKey
                  ? 'border-gold bg-gold/10 text-brown'
                  : 'border-cream-border bg-white text-brown-deep/70 hover:border-gold/50 hover:text-brown'
              }`}
            >
              {FAMILY_META[key].title}
            </Link>
          ))}
        </div>
        <CrawlableProductList products={products} />
      </div>
    </>
  );
}