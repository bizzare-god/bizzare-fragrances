import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { productDto } from '@/lib/serializers';
import { getStorewideSale } from '@/lib/promo';
import { ProductDetailView } from '@/components/store/ProductDetailView';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { slugify, productUrl, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: slugify(product.name),
  }));
}

interface ProductPageProps {
  params: { slug: string };
}

async function getProducts() {
  try {
    const [products, storewide] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      getStorewideSale(),
    ]);
    return products.map((product) => productDto(product, storewide));
  } catch (error) {
    console.error('[Product Page] Failed to load products:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const products = await getProducts();
  const product = products.find((item) => slugify(item.name) === params.slug) || null;

  if (!product) {
    return { title: 'Fragrance Not Found | Bizzare Fragrances' };
  }

  const notes = [...product.top_notes, ...product.middle_notes, ...product.base_notes]
    .map((note) => note.trim())
    .filter(Boolean)
    .join(', ');

  const title = `${product.name} - ${product.brand}`;
  const description = product.description
    ? `${product.description}${notes ? ` Notes: ${notes}.` : ''}`
    : `Buy 100% authentic ${product.name} by ${product.brand} from Bizzare Fragrances - a genuine imported ${product.scent_family} luxury perfume with delivery across Nigeria.${notes ? ` Notes: ${notes}.` : ''}`;

  const productImage = product.image_url || 'https://bizzarefragrances.shop/og-logo.png';
  const url = `${BASE_URL}${productUrl(product)}`;

  return {
    title: { absolute: `${title} | Bizzare Fragrances` },
    description,
    alternates: { canonical: `${BASE_URL}${productUrl(product)}` },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Bizzare Fragrances',
      images: [
        {
          url: productImage,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [productImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const products = await getProducts();
  const product = products.find((item) => slugify(item.name) === params.slug) || null;
  if (!product) return notFound();

  const related = products
    .filter((item) => item.id !== product.id)
    .filter((item) => item.scent_family === product.scent_family || item.brand === product.brand)
    .slice(0, 4);

  const productPath = productUrl(product);
  const breadcrumbItems = [
    { name: 'Home', url: `${BASE_URL}/` },
    { name: 'Perfumes', url: `${BASE_URL}/shop` },
    { name: product.name, url: `${BASE_URL}${productPath}` },
  ];

  return (
    <>
      <nav aria-label="Breadcrumb">
        <Breadcrumbs items={breadcrumbItems} />
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, BASE_URL)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      <ProductDetailView
        productId={product.id}
        initialProduct={product}
        relatedProducts={related}
      />
    </>
  );
}