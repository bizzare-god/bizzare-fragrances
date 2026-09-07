'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Headphones,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { PerfumeCard } from '@/components/store/PerfumeCard';
import { OrderTracker } from '@/components/store/OrderTracker';
import { ScentFamily } from '@/types';

const SCENT_FAMILY_CARDS: Array<{
  family: ScentFamily;
  title: string;
  notes: string;
  gradient: string;
  accent: string;
}> = [
  {
    family: 'Woody',
    title: 'Woody & Oud',
    notes: 'Smoked cedar, agarwood, sandalwood, earthy vetiver',
    gradient: 'from-amber-950/80 via-black to-brown-deep',
    accent: 'border-amber-700/40 text-amber-400',
  },
  {
    family: 'Floral',
    title: 'Floral & Rose',
    notes: 'Damask rose petals, jasmine sambac, powdery iris',
    gradient: 'from-rose-950/80 via-black to-brown-deep',
    accent: 'border-rose-700/40 text-rose-400',
  },
  {
    family: 'Oriental',
    title: 'Oriental & Amber',
    notes: 'Golden amber, frankincense resin, warm benzoin',
    gradient: 'from-orange-950/80 via-black to-brown-deep',
    accent: 'border-orange-700/40 text-orange-400',
  },
  {
    family: 'Gourmand',
    title: 'Gourmand & Vanilla',
    notes: 'Bourbon vanilla, toasted tonka, cacao, praline',
    gradient: 'from-yellow-950/80 via-black to-brown-deep',
    accent: 'border-yellow-700/40 text-yellow-400',
  },
  {
    family: 'Fresh',
    title: 'Fresh & Marine',
    notes: 'Sea salt, aquatic breeze, neroli, clean linen',
    gradient: 'from-cyan-950/80 via-black to-brown-deep',
    accent: 'border-cyan-700/40 text-cyan-400',
  },
  {
    family: 'Citrus',
    title: 'Citrus & Zest',
    notes: 'Calabrian bergamot, blood orange, sparkling mandarin',
    gradient: 'from-lime-950/80 via-black to-brown-deep',
    accent: 'border-lime-700/40 text-lime-400',
  },
];

export function HomeView() {
  const { products, orders, addToCart, currentUser, isAuthenticated } = useStoreContext();

  const buyerOrders =
    isAuthenticated && currentUser
      ? orders.filter((order) => order.customer_id === currentUser.id)
      : [];

  // Automatically select the most recently uploaded perfume as the featured fragrance
  const heroProduct = useMemo(() => {
    if (!products || products.length === 0) return null;
    return (
      [...products].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })[0] ?? products[0]
    );
  }, [products]);

  // Spotlight newest arrivals (up to 4 perfumes)
  const spotlightProducts = useMemo(() => {
    if (!products) return [];
    return [...products]
      .sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [products]);

  return (
    <div className="pb-16 text-brown-deep space-y-16">
      {/* HERO SHOWCASE */}
      <section className="relative min-h-[560px] overflow-hidden rounded-3xl bg-black text-white shadow-2xl">
        {heroProduct?.image_url && (
          <img
            src={heroProduct.image_url}
            alt={heroProduct.name}
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-brown-deep/40" />

        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
          <div className="max-w-2xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brown-warm/60 bg-black/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-brown-warm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-brown-warm" />
              100% Genuine Imported Luxury Perfumes
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-normal text-white">
                Bizzare Fragrances
                <span className="mt-3 block font-sans text-lg sm:text-2xl font-normal tracking-[0.2em] text-brown-warm">
                  (by Bizzare)
                </span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-7 sm:leading-8 text-cream-light/85 pt-2">
                Curated and directly imported from renowned international perfume houses across France, the UAE, Italy, and beyond. Explore concentrated extraits with notes clarity, escrow checkout, and express nationwide delivery.
              </p>
            </div>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brown-warm px-6 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-lg transition-all hover:bg-cream-light active:scale-[0.98]"
              >
                <span>Explore Full Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
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

          {/* Featured Fragrance Card (Newest Upload) */}
          {heroProduct && (
            <div className="hidden justify-self-end rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl md:block max-w-[320px]">
              <div className="aspect-[3/4] w-[280px] overflow-hidden rounded-xl bg-brown-deep">
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
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brown-warm">
                    Newly Added
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-white truncate">{heroProduct.name}</h2>
                  <p className="text-[11px] font-mono text-cream-muted">{heroProduct.brand} • {heroProduct.volume_ml}ml</p>
                </div>
                <span className="rounded-md border border-brown-warm px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-brown-warm shrink-0">
                  {heroProduct.stock > 0 ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="rounded-2xl border border-brown-deep/10 bg-cream-light p-6 sm:p-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: '100% Genuine Imports',
              text: 'Authentic manufacturer-sealed luxury fragrances sourced directly from overseas perfume houses.',
            },
            {
              icon: PackageCheck,
              title: 'Live Inventory Clarity',
              text: 'Real-time stock indicators with genuine volume, olfactory accords, and concentration details.',
            },
            {
              icon: Truck,
              title: 'Express Tracked Delivery',
              text: 'Follow your authentic imported fragrance from boutique dispatch to doorstep delivery across Nigeria.',
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

      {/* ACTIVE ORDERS TRACKER (IF USER HAS ORDERS) */}
      {buyerOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brown-warm">Live Fulfillment</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">Your Active Orders</h2>
            </div>
            <Link
              href="/account"
              className="font-mono text-xs font-bold uppercase tracking-wider text-brown hover:underline"
            >
              View Order History →
            </Link>
          </div>
          <div className="space-y-4">
            {buyerOrders.map((order) => (
              <OrderTracker key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS SPOTLIGHT */}
      {spotlightProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
                Latest Additions
              </p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brown hover:text-brown-hover transition-colors"
            >
              <span>Explore All Fragrances ({products.length})</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {spotlightProducts.map((product, index) => (
              <PerfumeCard key={product.id} product={product} onAddToCart={addToCart} index={index} />
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brown px-8 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md transition-all"
            >
              <span>Open Fragrance Collection</span>
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* OLFACTORY FAMILIES EXPLORER */}
      <section className="space-y-6">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
            Scent Taxonomy
          </p>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
            Explore by Olfactory Family
          </h2>
          <p className="mt-2 text-sm text-brown-deep/70 max-w-xl">
            Navigate our imported catalogue by your preferred fragrance accord mood and note profiles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENT_FAMILY_CARDS.map((item) => (
            <Link
              key={item.family}
              href={`/shop?family=${item.family}`}
              className={`group relative overflow-hidden rounded-2xl border border-cream-border bg-gradient-to-br ${item.gradient} p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-soft`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-lg border bg-black/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur ${item.accent}`}>
                  {item.family}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1 group-hover:bg-brown-warm group-hover:text-black">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-white group-hover:text-brown-warm transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-cream-light/75">
                {item.notes}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CONCIERGE HELP FOOTER BANNER */}
      <section className="rounded-2xl border border-cream-border bg-cream-light p-8 sm:p-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
              Concierge Service
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-brown-deep">Need scent guidance?</h2>
          </div>
          <div className="space-y-4 text-xs leading-6 text-brown-deep/70 md:col-span-2">
            <p className="text-sm leading-relaxed">
              Connect directly with our boutique fragrance specialists for bespoke recommendations, notes matching, or express delivery inquiries across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/customer-service"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-sm"
              >
                <Headphones className="h-4 w-4" />
                Customer Service Desk
              </Link>
              <a
                href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20to%20inquire%20about%20combo%20and%20bulk%20deals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-50 px-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Combo & Bulk Deals
              </a>
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
