'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';

interface PerfumeCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function PerfumeCard({ product, onAddToCart }: PerfumeCardProps) {
  const purchasable = product.stock > 0 && product.is_active;
  const lowStock = product.stock > 0 && product.stock < 5;

  return (
    <article className="group border border-cream-border bg-white">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-brown-deep">
          {product.image_url ? <img src={product.image_url} alt={product.name} className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${purchasable ? 'opacity-95' : 'opacity-45 grayscale'}`} /> : <div className="flex h-full items-center justify-center px-6 text-center font-serif text-xl text-cream-muted">Image pending</div>}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-light">
              {product.category ?? product.scent_family}
            </span>
            <span
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                purchasable ? 'bg-cream-light text-brown-deep' : 'bg-black text-brown-warm'
              }`}
            >
              {purchasable ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.2em] text-brown-warm">
              {product.brand}
            </p>
            <Link href={`/product/${product.id}`} className="mt-1 block">
              <h3 className="truncate font-serif text-xl font-bold text-brown-deep group-hover:text-brown">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-brown-deep/60">
              {product.volume_ml} ml / {product.scent_family}
            </p>
          </div>
          <Link
            href={`/product/${product.id}`}
            aria-label={`View ${product.name}`}
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-cream-border text-brown hover:border-brown hover:bg-brown hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-brown-deep/70">
          {[...product.top_notes.slice(0, 2), ...product.middle_notes.slice(0, 1), ...product.base_notes.slice(0, 1)].join(', ')}
        </p>

        <div className="flex items-end justify-between border-t border-cream-border pt-4">
          <div>
            <p className="font-serif text-xl font-bold text-brown">{formatCurrency(product.price)}</p>
            <p className={`mt-1 text-xs font-semibold ${lowStock ? 'text-red-700' : 'text-brown-deep/55'}`}>
              {purchasable ? `${product.stock} available${lowStock ? ' / low stock' : ''}` : 'Unavailable for purchase'}
            </p>
          </div>
          <Button
            size="sm"
            disabled={!purchasable}
            onClick={() => onAddToCart(product)}
            className="h-10 gap-2 bg-brown px-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-brown-hover"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{purchasable ? 'Add' : 'Sold'}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
