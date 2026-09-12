import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/seo';

export const revalidate = 300;

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductRedirectPage({ params }: ProductPageProps) {
  let name: string | null = null;
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { name: true },
    });
    if (product) name = product.name;
  } catch (error) {
    console.error('[Product Redirect] Failed to load product:', error);
  }

  if (name) redirect(`/products/${slugify(name)}`);
  redirect('/shop');
}