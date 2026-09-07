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

// Editorial staggered aspect ratios designed to balance across mobile (2-col), tablet (3-col), and desktop (4-col)
const MASONRY_ASPECT_RATIOS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[1/1]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[5/6]',
];

export function PerfumeCard({ product, onAddToCart, index = 0 }: PerfumeCardProps) {
  const purchasable = product.stock > 0 && product.is_active;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const aspectClass = MASONRY_ASPECT_RATIOS[index % MASONRY_ASPECT_RATIOS.length];

  const notesList = Array.from(
    new Set(
      [...product.top_notes, ...product.middle_notes, ...product.base_notes]
        .map((n) => n.trim())
        .filter(Boolean)
    )
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-cream-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brown/40 hover:shadow-card-soft">
      {/* Imagery with Dynamic Staggered Aspect Ratio */}
      <Link href={`/product/${product.id}`} className="relative block overflow-hidden bg-brown-deep">
        <div className={`w-full ${aspectClass} overflow-hidden bg-gradient-to-br from-brown-deep to-black`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                purchasable ? 'opacity-95' : 'opacity-40 grayscale'
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-brown-warm/50" />
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-40 transition-opacity duration-300 group-hover:opacity-75" />

        {/* Top Badges (Responsive scaling for phones and iPad/desktop) */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 sm:p-3">
          <span className="rounded-full bg-black/70 px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cream-light backdrop-blur-md border border-white/10 truncate max-w-[65%]">
            {product.scent_family}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[8px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shrink-0 ${
              purchasable
                ? lowStock
                  ? 'border border-amber-400/40 bg-amber-950/80 text-amber-300'
                  : 'border border-white/15 bg-white/90 text-brown-deep font-semibold'
                : 'border border-red-500/30 bg-black/80 text-red-400'
            }`}
          >
            {purchasable ? (lowStock ? `${product.stock} Left` : 'Available') : 'Sold Out'}
          </span>
        </div>

        {/* Hover / Tap Quick Detail Arrow */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hidden sm:block">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-brown-deep shadow-md backdrop-blur-md hover:bg-brown hover:text-white transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>
      </Link>

      {/* Content Details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 md:p-5">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Brand & Volume Header */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-[11px] font-mono uppercase tracking-wider text-brown-warm">
            <span className="truncate max-w-[60%]">{product.brand}</span>
            <span>{product.volume_ml}ml</span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-brown-deep transition-colors line-clamp-1 sm:line-clamp-2 group-hover:text-brown">
              {product.name}
            </h3>
          </Link>

          {/* Olfactory Accords / Fragrance Notes */}
          {notesList.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {notesList.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="inline-block rounded-md border border-cream-border bg-cream-soft/70 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-brown-deep/75 truncate max-w-[95px]"
                >
                  {note}
                </span>
              ))}
            </div>
          )}

          {/* Brief Description (Shown on tablet/desktop, compact on mobile) */}
          {product.description && (
            <p className="hidden sm:line-clamp-2 text-xs leading-relaxed text-brown-deep/65 pt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer with Price and Touch-Friendly Quick Add */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-cream-border/70 pt-2.5 sm:pt-3">
          <div className="min-w-0 pr-1">
            <p className="hidden sm:block text-[9px] uppercase tracking-wider font-mono text-brown-deep/50">Price</p>
            <p className="font-serif text-sm sm:text-base md:text-lg font-bold text-brown truncate">
              {formatCurrency(product.price)}
            </p>
          </div>

          <button
            type="button"
            disabled={!purchasable}
            onClick={() => onAddToCart(product)}
            className="inline-flex h-8 sm:h-9 md:h-10 items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-brown px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-brown-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{purchasable ? 'Add' : 'Sold'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
