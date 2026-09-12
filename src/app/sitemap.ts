import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { slugify, FAMILY_SLUGS } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://bizzarefragrances.shop';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/perfumes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  {
    url: `${BASE_URL}/customer-service`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const familyRoutes: MetadataRoute.Sitemap = FAMILY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/perfumes/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { name: true, updatedAt: true },
    });

    productRoutes = products.map((product) => ({
      url: `${BASE_URL}/products/${slugify(product.name)}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to load products:', error);
  }

  return [...staticRoutes, ...familyRoutes, ...productRoutes];
}