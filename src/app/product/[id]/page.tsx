'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { products, addToCart } = useStoreContext();
  const [product, setProduct] = useState<Product | null>(() => {
    return products.find((item) => item.id === params.id) || null;
  });
  const [loading, setLoading] = useState(!product);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const cached = products.find((item) => item.id === params.id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetch(`/api/products/${params.id}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Fragrance not found.');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.product) {
          setProduct(data.product);
          setFetchError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFetchError(err instanceof Error ? err.message : 'Unable to load fragrance.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id, products]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3 py-20 text-center text-brown-deep">
        <Loader2 className="h-8 w-8 animate-spin text-brown" />
        <p className="font-serif text-base font-bold">Loading Fragrance Edition...</p>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="mx-auto max-w-md py-20 text-center text-brown-deep">
        <h1 className="font-serif text-3xl font-bold">Fragrance Unavailable</h1>
        <p className="mt-3 text-sm text-brown-deep/65">
          {fetchError || 'The requested fragrance edition could not be located in our collection.'}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-6 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to collection
        </Link>
      </div>
    );
  }

  const purchasable = product.stock > 0 && product.is_active;
  const allNotes = Array.from(
    new Set(
      [...(product.top_notes || []), ...(product.middle_notes || []), ...(product.base_notes || [])]
        .map((n) => n.trim())
        .filter(Boolean)
    )
  );

  return (
    <div className="pb-16 pt-6 text-brown-deep">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-brown hover:text-brown-hover">
        <ArrowLeft className="h-4 w-4" />
        Back to collection
      </Link>

      <section className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-2xl border border-cream-border bg-brown-deep shadow-md">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="aspect-[4/5] h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center px-8 text-center font-serif text-2xl text-cream-muted">
              Product image pending
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-4 border-b border-cream-border pb-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">{product.brand}</p>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-none">{product.name}</h1>
              <p className="mt-3 text-base text-brown-deep/65 font-mono text-xs">
                {product.category ?? 'Haute Parfumerie'} • {product.volume_ml} ml • {product.scent_family}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-serif text-3xl font-bold text-brown">{formatCurrency(product.price)}</p>
              <span
                className={`border rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                  purchasable ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-brown text-brown'
                }`}
              >
                {purchasable ? `${product.stock} bottles available` : 'Sold out'}
              </span>
              {product.stock > 0 && product.stock < 5 && (
                <span className="border border-red-700 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-red-700 rounded-lg">
                  Low stock
                </span>
              )}
            </div>
          </div>

          {/* Unified Fragrance Story & Olfactory Profile */}
          <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-border/70 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brown-warm">
                Fragrance Profile
              </span>
              <span className="font-mono text-xs font-bold text-brown bg-cream-soft px-2.5 py-0.5 rounded-full border border-cream-border">
                {product.scent_family}
              </span>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-brown-deep/80">
              {product.description ||
                `An exclusive creation by ${product.brand}, composed for connoisseurs who appreciate artisanal craftsmanship, longevity, and olfactory distinction.`}
              {allNotes.length > 0
                ? ` The fragrance wears as one seamless signature accord of ${allNotes.join(', ')}.`
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!purchasable}
              onClick={() => addToCart(product)}
              className="h-12 gap-2 bg-brown px-6 text-sm font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              {purchasable ? 'Add to cart' : 'Sold out'}
            </Button>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center rounded-xl border border-cream-border bg-white px-6 text-sm font-semibold text-brown-deep hover:border-brown"
            >
              Continue exploring
            </Link>
          </div>

          <div className="grid gap-3 border-t border-cream-border pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-brown" />
              <p className="text-xs leading-5 text-brown-deep/70">100% genuine imported luxury fragrance with secure Paystack checkout.</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-brown" />
              <p className="text-xs leading-5 text-brown-deep/70">Protective luxury packaging and direct tracked fulfillment by Bizzare.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
