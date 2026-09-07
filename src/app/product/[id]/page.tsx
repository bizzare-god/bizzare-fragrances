import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductDetailView } from '@/components/store/ProductDetailView';

const BASE_URL = 'https://bizzarefragrances.shop';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({ where: { id } });
  } catch (error) {
    console.error('[Product Page] Failed to load product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Fragrance Not Found | Bizzare Fragrances',
    };
  }

  const notes = [...product.topNotes, ...product.middleNotes, ...product.baseNotes]
    .map((note) => note.trim())
    .filter(Boolean)
    .join(', ');

  const title = `${product.name} by ${product.brand} | Bizzare & Bizarre Perfumes`;
  const description = product.description
    ? `${product.description}${notes ? ` Notes: ${notes}.` : ''}`
    : `Buy 100% authentic ${product.name} by ${product.brand} - a genuine imported ${product.scentFamily} luxury fragrance from Bizzare (Bizarre) Fragrances Nigeria.${notes ? ` Notes: ${notes}.` : ''}`;

  const productImage = product.images[0] || '/og-logo.png';

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      type: 'article',
      url: `${BASE_URL}/product/${product.id}`,
      title,
      description,
      images: [{ url: productImage, alt: `${product.name} by ${product.brand}` }],
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
  const product = await getProduct(params.id);
  if (!product) return notFound();

  return <ProductDetailView productId={params.id} />;
}