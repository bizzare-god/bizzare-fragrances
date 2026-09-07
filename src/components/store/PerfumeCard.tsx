'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, Sparkles, ShoppingBag } from 'lucide-react';

interface PerfumeCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  index?: number;
}

// Varied editorial aspect ratios for staggered Masonry lookbook grid
const MASONRY_ASPECT_RATIOS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[1/1]',
  'aspect-[3/4]',
  'aspect-[4/5]',
];

export function PerfumeCard({ product, onAddToCart, index = 0 }: PerfumeCardProps) {
  const purchasable = product.stock > 0 && product.is_active;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const aspectClass = MASONRY_ASPECT_RATIOS[index % MASONRY_ASPECT_RATIOS.length];

  const notesList = [
    ...product.top_notes.slice(0, 2),
    ...product.middle_notes.slice(0, 2),
    ...product.base_notes.slice(0, 1),
  ].filter(Boolean);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-border bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-brown/40 hover:shadow-card-soft">
      {/* Imagery with Dynamic Staggered Masonry Aspect Ratio */}
      <Link href={`/product/${product.id}`} className="relative block overflow-hidden bg-brown-deep">
        <div className={`w-full ${aspectClass} overflow-hidden bg-gradient-to-br from-brown-deep to-black`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                purchasable ? 'opacity-95' : 'opacity-40 grayscale'
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <Sparkles className="h-8 w-8 text-brown-warm/50" />
            </div>
          )}
        </div>

        {/* Floating Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Top Badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <span className="rounded-full bg-black/65 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cream-light backdrop-blur-md border border-white/10">
            {product.scent_family}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md ${
              purchasable
                ? lowStock
                  ? 'border border-amber-400/40 bg-amber-950/75 text-amber-300'
                  : 'border border-white/15 bg-white/90 text-brown-deep font-semibold shadow-sm'
                : 'border border-red-500/30 bg-black/80 text-red-400'
            }`}
          >
            {purchasable ? (lowStock ? `${product.stock} Left` : 'Available') : 'Sold Out'}
          </span>
        </div>

        {/* Hover Quick View Trigger */}
        <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brown-deep shadow-lg backdrop-blur-md hover:bg-brown hover:text-white transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      {/* Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-brown-warm">
            <span>{product.brand}</span>
            <span>{product.volume_ml}ml Extrait</span>
          </div>

          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brown-deep transition-colors group-hover:text-brown">
              {product.name}
            </h3>
          </Link>

          {/* Olfactory Accords / Fragrance Notes */}
          {notesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {notesList.map((note) => (
                <span
                  key={note}
                  className="inline-block rounded-md border border-cream-border bg-cream-soft/60 px-2 py-0.5 text-[10px] font-medium text-brown-deep/75"
                >
                  {note}
                </span>
              ))}
            </div>
          )}

          {product.description && (
            <p className="line-clamp-2 text-xs leading-5 text-brown-deep/65">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer with Price and Quick Add */}
        <div className="mt-4 flex items-center justify-between border-t border-cream-border/70 pt-3.5">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono text-brown-deep/50">Acquisition</p>
            <p className="font-serif text-lg sm:text-xl font-bold text-brown">
              {formatCurrency(product.price)}
            </p>
          </div>

          <button
            type="button"
            disabled={!purchasable}
            onClick={() => onAddToCart(product)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brown px-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:bg-brown-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{purchasable ? 'Add' : 'Sold'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
