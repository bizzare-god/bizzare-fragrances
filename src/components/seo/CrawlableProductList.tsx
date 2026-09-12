import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { productUrl } from '@/lib/seo';

export function CrawlableProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-brown-deep/70">
        No fragrances are available in this category right now. Check back soon or explore the{' '}
        <Link href="/shop" className="font-semibold text-brown hover:underline">
          full collection
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" data-testid="crawlable-products">
      {products.map((product) => {
        const inStock = product.stock > 0 && product.is_active;
        return (
          <li key={product.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-cream-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-card-soft">
              <Link href={productUrl(product)} className="relative block aspect-[3/4] overflow-hidden bg-brown-deep">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-cream-muted">
                    {product.name}
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-3">
                <Link
                  href={productUrl(product)}
                  className="font-serif text-sm font-bold leading-snug text-brown-deep transition-colors hover:text-brown"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-brown-warm">
                  {product.brand}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-cream-border/70 pt-2">
                  <p className="font-serif text-sm font-bold text-brown">
                    {formatCurrency(product.price)}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      inStock ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {inStock ? (product.stock <= 3 ? `${product.stock} left` : 'In stock') : 'Sold out'}
                  </p>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}