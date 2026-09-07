'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { PerfumeCard } from '@/components/store/PerfumeCard';
import { OrderTracker } from '@/components/store/OrderTracker';
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

function StorefrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, orders, addToCart, currentUser, isAuthenticated, isLoading, dataError } = useStoreContext();

  const [selectedFamily, setSelectedFamily] = useState<ScentFamily | 'ALL'>('ALL');
  const [selectedPrice, setSelectedPrice] = useState(priceBands[0].label);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL search query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const buyerOrders =
    isAuthenticated && currentUser
      ? orders.filter((order) => order.customer_id === currentUser.id)
      : [];
  const heroProduct = products.find((product) => product.stock > 0) ?? products[0];

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleClearFilters = () => {
    setSelectedFamily('ALL');
    setSelectedPrice(priceBands[0].label);
    setSearchQuery('');
    router.push('/shop#shop');
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
    <div className="pb-16 text-brown-deep">
      {/* HERO SECTION */}
      <section className="relative min-h-[560px] overflow-hidden rounded-3xl bg-black text-white shadow-2xl">
        {heroProduct?.image_url && (
          <img
            src={heroProduct.image_url}
            alt={heroProduct.name}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-brown-deep/40" />
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brown-warm/60 bg-black/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-brown-warm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-brown-warm" />
              Haute Parfumerie & Luxury Perfumes
            </div>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl font-bold leading-[0.95] tracking-normal text-white sm:text-7xl">
                Bizzare Fragrances
                <span className="mt-3 block font-sans text-xl font-normal tracking-[0.2em] text-brown-warm sm:text-2xl">
                  (by Bizzare)
                </span>
              </h1>
              <p className="max-w-xl text-base leading-8 text-cream-light/85 sm:text-lg">
                Minimal, rare, and deliberately edited. Discover pure oud, Damask rose, citrus zest, smoldering woods, and skin musks with secure checkout, real-time tracking, and concierge support.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#shop"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brown-warm px-6 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-lg transition-all hover:bg-cream-light active:scale-[0.98]"
              >
                Explore Fragrances
                <ArrowRight className="h-4 w-4" />
              </a>
              {heroProduct && (
                <Link
                  href={`/product/${heroProduct.id}`}
                  className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur transition-all hover:border-brown-warm hover:bg-white/10 hover:text-brown-warm"
                >
                  View Featured Scent
                </Link>
              )}
            </div>
          </div>

          {heroProduct && (
            <div className="hidden justify-self-end rounded-2xl border border-white/15 bg-black/60 p-5 shadow-2xl backdrop-blur-xl md:block">
              <div className="aspect-[3/4] w-[300px] overflow-hidden rounded-xl bg-brown-deep">
                {heroProduct.image_url ? (
                  <img
                    src={heroProduct.image_url}
                    alt={heroProduct.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center font-serif text-2xl text-cream-muted">
                    Featured fragrance
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brown-warm">
                    Featured Fragrance
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-white">{heroProduct.name}</h2>
                </div>
                <span className="rounded-md border border-brown-warm px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-brown-warm">
                  {heroProduct.stock > 0 ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="mt-8 rounded-2xl border border-brown-deep/10 bg-cream-light p-6 sm:p-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'Secure Escrow Checkout',
              text: 'Pay safely with instant transaction confirmations for every luxury purchase.',
            },
            {
              icon: PackageCheck,
              title: 'Live Inventory Clarity',
              text: 'Real-time stock indicators ensure authentic, available extrait bottles.',
            },
            {
              icon: Truck,
              title: 'Express Tracked Delivery',
              text: 'Follow your fragrance from boutique bottling to doorstep delivery.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brown/10 text-brown">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-brown-deep">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-brown-deep/70">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BUYER ACTIVE ORDERS */}
      {buyerOrders.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Your Active Orders</h2>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-brown">
              {buyerOrders.length} active
            </span>
          </div>
          <div className="space-y-4">
            {buyerOrders.map((order) => (
              <OrderTracker key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* UNIFIED SHOPPING & FILTER CONSOLE */}
      <section id="shop" className="mt-12 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
              The Collection
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-brown-deep sm:text-4xl">
              Shop Fragrances
            </h2>
          </div>
          <div className="font-mono text-xs text-brown-deep/60">
            Showing <strong className="text-brown-deep font-bold">{filteredProducts.length}</strong> fragrances
          </div>
        </div>

        {/* SINGLE UNIFIED FILTER & SEARCH CONSOLE */}
        <div className="rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm" />
              <input
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search perfume name, olfactory notes, brand..."
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

          {/* Scent Family Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cream-border/60">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brown-deep/50 mr-1">
              Family:
            </span>
            {families.map((family) => (
              <button
                key={family}
                type="button"
                onClick={() => setSelectedFamily(family)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
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
                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 font-mono uppercase tracking-wider"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID */}
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
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="break-inside-avoid mb-6">
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
            <h2 className="mt-2 font-serif text-3xl font-bold text-brown-deep">Need help choosing?</h2>
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
                Customer Service
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

export function StorefrontView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brown border-t-transparent" />
        </div>
      }
    >
      <StorefrontContent />
    </Suspense>
  );
}
