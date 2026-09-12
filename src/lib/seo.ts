import type { Product } from '@/types';

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'product'
  );
}

export const FAMILY_SLUGS = ['woody', 'floral', 'oriental', 'fresh', 'gourmand', 'citrus', 'aromatic'] as const;
export type FamilySlug = (typeof FAMILY_SLUGS)[number];

export function isFamilySlug(value: string): value is FamilySlug {
  return (FAMILY_SLUGS as readonly string[]).includes(value);
}

export const FAMILY_NAME: Record<FamilySlug, string> = {
  woody: 'Woody',
  floral: 'Floral',
  oriental: 'Oriental',
  fresh: 'Fresh',
  gourmand: 'Gourmand',
  citrus: 'Citrus',
  aromatic: 'Aromatic',
};

export const FAMILY_META: Record<
  FamilySlug,
  { title: string; h1: string; description: string; intro: string }
> = {
  woody: {
    title: 'Woody & Oud Perfumes',
    h1: 'Woody & Oud Perfumes in Nigeria',
    description:
      'Shop authentic woody and oud perfumes in Nigeria - sandalwood, cedar, vetiver and rare oud extraits imported by Bizzare Fragrances.',
    intro:
      'Explore woody and oud perfumes available from Bizzare Fragrances. Discover rich fragrances featuring oud, sandalwood, cedar and other woody notes, with delivery across Nigeria.',
  },
  floral: {
    title: 'Floral Perfumes',
    h1: 'Floral Perfumes in Nigeria',
    description:
      'Shop authentic floral perfumes in Nigeria - rose, jasmine and iris compositions imported by Bizzare Fragrances with nationwide delivery.',
    intro:
      'Explore floral perfumes available from Bizzare Fragrances. Discover elegant scents built around rose, jasmine, iris and other florals, with delivery across Nigeria.',
  },
  oriental: {
    title: 'Oriental & Amber Perfumes',
    h1: 'Oriental & Amber Perfumes in Nigeria',
    description:
      'Shop authentic oriental and amber perfumes in Nigeria - amber, incense and oud compositions imported by Bizzare Fragrances.',
    intro:
      'Explore oriental and amber perfumes available from Bizzare Fragrances. Discover warm compositions of amber, incense, oud and resinous notes, with delivery across Nigeria.',
  },
  fresh: {
    title: 'Fresh Perfumes',
    h1: 'Fresh Perfumes in Nigeria',
    description:
      'Shop authentic fresh perfumes in Nigeria - clean, aquatic and citrus-forward scents imported by Bizzare Fragrances.',
    intro:
      'Explore fresh perfumes available from Bizzare Fragrances. Discover clean, aquatic and citrus-forward scents, with delivery across Nigeria.',
  },
  gourmand: {
    title: 'Gourmand & Vanilla Perfumes',
    h1: 'Gourmand & Vanilla Perfumes in Nigeria',
    description:
      'Shop authentic gourmand and vanilla perfumes in Nigeria - sweet vanillas, tonka and caramel compositions imported by Bizzare Fragrances.',
    intro:
      'Explore gourmand perfumes available from Bizzare Fragrances. Discover sweet, delicious scents featuring vanilla, tonka and caramel notes, with delivery across Nigeria.',
  },
  citrus: {
    title: 'Citrus Perfumes',
    h1: 'Citrus Perfumes in Nigeria',
    description:
      'Shop authentic citrus perfumes in Nigeria - bergamot, lemon and orange compositions imported by Bizzare Fragrances.',
    intro:
      'Explore citrus perfumes available from Bizzare Fragrances. Discover bright, zesty bergamot, lemon and orange compositions, with delivery across Nigeria.',
  },
  aromatic: {
    title: 'Aromatic Perfumes',
    h1: 'Aromatic Perfumes in Nigeria',
    description:
      'Shop authentic aromatic perfumes in Nigeria - fresh herbaceous scents with lavender and sage imported by Bizzare Fragrances.',
    intro:
      'Explore aromatic perfumes available from Bizzare Fragrances. Discover fresh herbaceous scents with lavender, sage and aromatic accords, with delivery across Nigeria.',
  },
};

export function productUrl(product: Pick<Product, 'id' | 'name'>): string {
  return `/products/${slugify(product.name)}`;
}

export function productJsonLd(product: Product, baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url.startsWith('/') ? `${baseUrl}${product.image_url}` : product.image_url] : undefined,
    description: product.description || undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand },
    url: `${baseUrl}${productUrl(product)}`,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}${productUrl(product)}`,
      priceCurrency: 'NGN',
      price: String(product.price),
      availability:
        product.stock > 0 && product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}