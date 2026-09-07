'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Headphones,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { PerfumeCard } from '@/components/store/PerfumeCard';
import { ScentFamily } from '@/types';

const families: (ScentFamily | 'ALL')[] = [
  'ALL',
  'Woody',
  'Floral',
  'Oriental',
  'Fresh',
  'Gourmand',
  'Citrus',
  'Aromatic',
];

const priceBands = [
  { label: 'All prices', min: 0, max: Number.POSITIVE_INFINITY },
  { label: 'Under ₦200k', min: 0, max: 200000 },
  { label: '₦200k - ₦300k', min: 200000, max: 300000 },
  { label: '₦300k+', min: 300000, max: Number.POSITIVE_INFINITY },
];

function CollectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, addToCart, isLoading, dataError } = useStoreContext();

  const [selectedFamily, setSelectedFamily] = useState<ScentFamily | 'ALL'>('ALL');
  const [selectedPrice, setSelectedPrice] = useState(priceBands[0].label);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL search query param and family param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
    const family = searchParams.get('family');
    if (family && families.includes(family as ScentFamily)) {
      setSelectedFamily(family as ScentFamily);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleClearFilters = () => {
    setSelectedFamily('ALL');
    setSelectedPrice(priceBands[0].label);
    setSearchQuery('');
    router.push('/shop');
  };

  const filteredProducts = useMemo(() => {
    const band = priceBands.find((priceBand) => priceBand.label === selectedPrice) ?? priceBands[0];
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesFamily = selectedFamily === 'ALL' || product.scent_family === selectedFamily;
      const matchesPrice = product.price >= band.min && product.price <= band.max;
      const searchable = [
        product.name,
        product.brand,
        product.category,
        product.scent_family,
        ...product.top_notes,
        ...product.middle_notes,
        ...product.base_notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesFamily && matchesPrice && (!query || searchable.includes(query));
    });
  }, [products, searchQuery, selectedFamily, selectedPrice]);

  const hasActiveFilters =
    selectedFamily !== 'ALL' || selectedPrice !== priceBands[0].label || searchQuery.trim().length > 0;

  return (
    <div className="pb-16 text-brown-deep space-y-8">
      {/* COLLECTION HEADER */}
      <div className="rounded-3xl border border-cream-border bg-white p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brown/20 bg-cream-soft px-3.5 py-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-brown">
            <Sparkles className="h-3.5 w-3.5 text-brown-warm" />
            Imported Haute Parfumerie Catalog
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-bold leading-tight text-brown-deep">
            The Fragrance Collection
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-brown-deep/75 max-w-2xl">
            Browse the complete catalogue of 100% authentic, imported luxury and niche perfumes — Bizzare perfumes and Bizarre Fragrances, sourced from prestigious houses across France, the UAE, Italy, and the UK. Filter by olfactory family, price range, or signature notes.
          </p>
        </div>
      </div>

      {/* UNIFIED SHOPPING & FILTER CONSOLE */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm" />
              <input
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search fragrance name, notes (oud, rose, amber, vanilla), brand..."
                className="h-11 w-full rounded-xl border border-cream-border bg-cream-soft pl-10 pr-9 text-sm text-brown-deep placeholder:text-brown-deep/40 focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brown-deep/40 hover:text-brown-deep"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Price Filter Dropdown */}
            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm pointer-events-none" />
              <select
                value={selectedPrice}
                onChange={(event) => setSelectedPrice(event.target.value)}
                className="h-11 w-full rounded-xl border border-cream-border bg-cream-soft pl-10 pr-4 text-xs font-bold uppercase tracking-wider text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown appearance-none cursor-pointer"
              >
                {priceBands.map((band) => (
                  <option key={band.label} value={band.label}>
                    Price: {band.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scent Family Category Filter Chips (Touch-scrollable on mobile/tablet) */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-cream-border/60 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brown-deep/50 mr-0.5 shrink-0">
              Family:
            </span>
            {families.map((family) => (
              <button
                key={family}
                type="button"
                onClick={() => setSelectedFamily(family)}
                className={`shrink-0 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  selectedFamily === family
                    ? 'bg-brown text-white shadow-sm'
                    : 'border border-cream-border bg-cream-soft text-brown-deep/70 hover:border-brown hover:bg-white hover:text-brown-deep'
                }`}
              >
                {family === 'ALL' ? 'All Families' : family}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="ml-auto shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-red-600 hover:text-red-700 font-mono uppercase tracking-wider pl-2"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter Bar */}
        <div className="flex items-center justify-between px-1">
          <p className="font-mono text-xs text-brown-deep/65">
            Displaying <strong className="text-brown-deep font-bold">{filteredProducts.length}</strong> of{' '}
            <strong className="text-brown-deep font-bold">{products.length}</strong> fragrances
          </p>
        </div>

        {/* PRODUCTS MASONRY GRID (2-Col Mobile, 3-Col iPad/Tablet, 4-Col Wide Desktop) */}
        {isLoading ? (
          <div className="rounded-2xl border border-cream-border bg-white px-6 py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brown border-t-transparent" />
            <p className="mt-3 text-sm font-serif font-bold text-brown-deep">Loading fragrance collection...</p>
          </div>
        ) : dataError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-16 text-center">
            <h3 className="font-serif text-2xl font-bold text-amber-900">Catalog Unavailable</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-amber-800/80">{dataError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-cream-border bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cream-border bg-cream-soft text-brown">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-bold text-brown-deep">No Fragrances Found</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-brown-deep/65">
              No perfumes match your current filters. Try changing your search keywords or resetting scent family filters.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brown px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 [column-fill:_balance]">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="break-inside-avoid mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <PerfumeCard product={product} onAddToCart={addToCart} index={index} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONCIERGE HELP FOOTER BANNER */}
      <section className="mt-16 rounded-2xl border border-cream-border bg-cream-light p-8 sm:p-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
              Concierge Service
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-brown-deep">Need scent guidance?</h2>
          </div>
          <div className="space-y-4 text-xs leading-6 text-brown-deep/70 md:col-span-2">
            <p className="text-sm leading-relaxed">
              Ask for scent guidance, delivery updates, or bespoke recommendations from the Bizzare Fragrances concierge desk. Tell us the occasion, season, and scent mood you desire.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/customer-service"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-sm"
              >
                <Headphones className="h-4 w-4" />
                Customer Service Desk
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-11 items-center rounded-xl border border-cream-border bg-white px-5 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep hover:border-brown"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CollectionView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brown border-t-transparent" />
        </div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
