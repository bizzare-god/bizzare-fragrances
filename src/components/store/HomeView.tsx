'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Headphones,
  HelpCircle,
  MapPin,
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
import { PromoBanner } from '@/components/layout/PromoBanner';
import { Product, ScentFamily } from '@/types';
import { productUrl } from '@/lib/seo';

const SCENT_FAMILY_CARDS: Array<{
  family: ScentFamily;
  slug: string;
  href: string;
  title: string;
  copy: string;
  gradient: string;
  accent: string;
}> = [
  {
    family: 'Woody',
    slug: 'woody',
    href: '/perfumes/woody',
    title: 'Woody & Oud',
    copy: 'Rich and sophisticated scents featuring oud, woods, leather and spice.',
    gradient: 'from-amber-950/85 via-black to-brown-deep',
    accent: 'border-amber-700/40 text-amber-400',
  },
  {
    family: 'Floral',
    slug: 'floral',
    href: '/perfumes/floral',
    title: 'Floral & Rose',
    copy: 'Elegant fragrances built around rose, jasmine and beautiful floral accords.',
    gradient: 'from-rose-950/85 via-black to-brown-deep',
    accent: 'border-rose-700/40 text-rose-400',
  },
  {
    family: 'Oriental',
    slug: 'oriental',
    href: '/perfumes/oriental',
    title: 'Oriental & Amber',
    copy: 'Warm and captivating scents featuring amber, spice, resin and exotic accords.',
    gradient: 'from-orange-950/85 via-black to-brown-deep',
    accent: 'border-orange-700/40 text-orange-400',
  },
  {
    family: 'Gourmand',
    slug: 'gourmand',
    href: '/perfumes/gourmand',
    title: 'Gourmand & Vanilla',
    copy: 'Sweet and indulgent fragrances with vanilla, caramel, chocolate and creamy notes.',
    gradient: 'from-yellow-950/85 via-black to-brown-deep',
    accent: 'border-yellow-700/40 text-yellow-400',
  },
  {
    family: 'Fresh',
    slug: 'fresh',
    href: '/perfumes/fresh',
    title: 'Fresh & Marine',
    copy: 'Clean and refreshing fragrances inspired by citrus, aquatic and airy notes.',
    gradient: 'from-cyan-950/85 via-black to-brown-deep',
    accent: 'border-cyan-700/40 text-cyan-400',
  },
  {
    family: 'Citrus',
    slug: 'citrus',
    href: '/perfumes/citrus',
    title: 'Citrus & Zest',
    copy: 'Bright and energetic fragrances with sparkling citrus accords.',
    gradient: 'from-lime-950/85 via-black to-brown-deep',
    accent: 'border-lime-700/40 text-lime-400',
  },
];

const HOMEPAGE_FAQS = [
  {
    question: 'Are your perfumes authentic?',
    answer:
      'All our perfumes are 100% genuine, authentic luxury and niche fragrances imported directly from reputable perfume houses, certified distributors, and perfumeries across France, Italy, the UAE, and the UK. Each bottle is inspected and dispatched in original manufacturer packaging.',
  },
  {
    question: 'Do you deliver across Nigeria?',
    answer:
      'Yes. Deliveries within Lagos are typically completed within 24 to 48 hours. Deliveries to Abuja, Port Harcourt, and other states across Nigeria take 2 to 4 business days via tracked nationwide courier service with real-time updates.',
  },
  {
    question: 'How can I choose the right fragrance?',
    answer:
      'Our concierge team offers complimentary fragrance guidance. Simply tell us the scents you already love, the occasion you are shopping for, or the impression you want to make, and we will recommend matching formulations.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Browse our online collection, select your fragrance, and click Add to Cart. You can complete checkout securely via Flutterwave using any Nigerian debit card, credit card, or direct bank transfer.',
  },
];

interface HomeViewProps {
  initialProducts?: Product[];
}

export function HomeView({ initialProducts = [] }: HomeViewProps) {
  const { products: contextProducts, orders, addToCart, currentUser, isAuthenticated } = useStoreContext();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const products = contextProducts && contextProducts.length > 0 ? contextProducts : initialProducts;

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

  // Spotlight arrivals (up to 4 perfumes for clean showcase)
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
    <div className="pb-16 text-brown-deep space-y-16 sm:space-y-20">
      {/* 0. ACTIVE PROMOTIONS / ADVERT BANNERS */}
      <PromoBanner />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[560px] overflow-hidden rounded-3xl bg-black text-white shadow-2xl">
        {heroProduct?.image_url && (
          <Image
            src={heroProduct.image_url}
            alt={heroProduct.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-brown-deep/40" />

        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
          <div className="max-w-2xl space-y-7">
            <div className="space-y-3">
              <p className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.26em] text-brown-warm">
                Bizzare Fragrances
              </p>
              {/* Only H1 on the entire homepage */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
                Original Imported Perfumes in Nigeria
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-7 sm:leading-8 text-cream-light/85 pt-2">
                Discover a carefully selected collection of original designer, niche and luxury fragrances sourced from renowned fragrance markets including France, Italy, the UAE and the UK. Shop your next signature scent with delivery across Nigeria.
              </p>
            </div>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-gold-gradient px-6 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep shadow-lg shadow-gold/30 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span>Shop Fragrances</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/customer-service"
                className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur transition-all hover:border-brown-warm hover:bg-white/10 hover:text-brown-warm"
              >
                <span>Find Your Signature Scent</span>
              </Link>
            </div>
          </div>

          {/* Featured Fragrance Card (Newest Upload) */}
          {heroProduct && (
            <div className="hidden justify-self-end rounded-2xl border border-white/15 bg-black/65 p-5 shadow-2xl backdrop-blur-xl md:block max-w-[320px]">
              <div className="relative aspect-[3/4] w-[280px] overflow-hidden rounded-xl bg-brown-deep">
                {heroProduct.image_url ? (
                  <Image
                    src={heroProduct.image_url}
                    alt={heroProduct.name}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center font-serif text-2xl text-cream-muted">
                    Featured fragrance
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
                    Featured Edition
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-white truncate">{heroProduct.name}</p>
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

      {/* 2. TRUST / VALUE STRIP (Compact, 4 concise points) */}
      <section className="rounded-2xl border border-brown-deep/10 bg-cream-light p-5 sm:p-7 shadow-sm">
        <div className="mx-auto grid max-w-7xl gap-5 grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Authentic Fragrances',
              text: 'Genuine imported fragrances sourced through trusted channels.',
            },
            {
              icon: Sparkles,
              title: 'Carefully Selected',
              text: 'A curated collection for fragrance lovers who value quality and character.',
            },
            {
              icon: Truck,
              title: 'Nationwide Delivery',
              text: 'Get your fragrance delivered across Nigeria.',
            },
            {
              icon: Headphones,
              title: 'Fragrance Guidance',
              text: 'Need help choosing? Our team can help you find the right scent.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-brown-deep leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-brown-deep/70">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACTIVE ORDERS TRACKER (IF AUTHENTICATED USER HAS ORDERS) */}
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

      {/* 3. FRAGRANCE CATEGORIES SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
              Scent Profiles
            </p>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
              Explore Our Fragrance Families
            </h2>
            <p className="mt-2 text-sm text-brown-deep/70 max-w-xl">
              Navigate our imported collection by your preferred notes, mood, and olfactory character.
            </p>
          </div>
          <Link
            href="/perfumes"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brown hover:text-brown-hover transition-colors"
          >
            <span>All Categories</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENT_FAMILY_CARDS.map((item) => (
            <Link
              key={item.family}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl border border-cream-border bg-gradient-to-br ${item.gradient} p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-soft`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-lg border bg-black/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur ${item.accent}`}
                >
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
                {item.copy}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section className="rounded-3xl border border-cream-border bg-cream-light p-8 sm:p-12 shadow-sm">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brown/20 bg-white px-3.5 py-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-brown">
            <Sparkles className="h-3.5 w-3.5 text-brown-warm" />
            Our Philosophy
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-deep leading-tight">
            A Fragrance Collection Curated With Intention
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-brown-deep/80 max-w-2xl mx-auto pt-1">
            At Bizzare Fragrances, we believe the right fragrance should feel personal. Our collection brings together original imported perfumes chosen for their quality, character and individuality. From timeless designer classics to distinctive niche scents, we make it easier to discover a fragrance that feels like you.
          </p>
        </div>
      </section>

      {/* 5. SHOPPING SECTION (PRODUCTS) */}
      {spotlightProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-gold-gradient">
                Curated Selection
              </p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
                Explore Our Fragrances
              </h2>
              <p className="mt-2 text-sm text-brown-deep/70 max-w-xl">
                Discover designer, niche and luxury perfumes for men and women, from everyday signatures to unforgettable scents for special occasions.
              </p>
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

          <div className="text-center pt-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brown px-8 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md transition-all active:scale-[0.98]"
            >
              <span>Explore Full Collection</span>
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 6. AUTHENTICITY / TRUST SECTION */}
      <section className="rounded-3xl border border-cream-border bg-white p-8 sm:p-10 shadow-sm">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brown/20 bg-cream-soft px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brown">
              <ShieldCheck className="h-3.5 w-3.5 text-brown-warm" />
              Direct Authenticity
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
              Original Fragrances. Carefully Sourced.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brown-deep/80">
              We are committed to bringing fragrance lovers genuine imported perfumes sourced through trusted channels. Every fragrance is selected with quality, authenticity and the customer experience in mind.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-cream-border bg-cream-light p-4">
                <p className="font-serif text-sm font-bold text-brown-deep">Manufacturer Seals</p>
                <p className="mt-1 text-xs text-brown-deep/70">Original boxes, batch numbers, and protective manufacturer seals.</p>
              </div>
              <div className="rounded-xl border border-cream-border bg-cream-light p-4">
                <p className="font-serif text-sm font-bold text-brown-deep">Direct Verification</p>
                <p className="mt-1 text-xs text-brown-deep/70">Sourced exclusively from verified distributors across Europe and the UAE.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brown-deep/15 bg-cream-soft p-6 sm:p-8 space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brown-warm font-bold">
              Our Standard
            </p>
            <h3 className="font-serif text-xl font-bold text-brown-deep">
              Authenticity Guaranteed on Every Bottle
            </h3>
            <p className="text-xs sm:text-sm leading-6 text-brown-deep/75">
              We operate with strict sourcing integrity. Whether you are discovering a rare extrait or a signature designer Eau de Parfum, you receive original formulations with notes clarity and verified condition.
            </p>
            <div className="pt-1">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brown hover:underline"
              >
                <span>Read About Our Sourcing Standards</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NIGERIA / DELIVERY SECTION */}
      <section className="rounded-3xl border border-brown-deep/15 bg-gradient-to-br from-black via-brown-deep to-black p-8 sm:p-12 text-white shadow-xl">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brown-warm/30 bg-brown-deep/60 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brown-warm">
              <MapPin className="h-3.5 w-3.5 text-brown-warm" />
              Nigeria Fulfillment
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              Your Fragrance, Delivered Across Nigeria
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-cream-light/85 max-w-xl">
              From Abuja to Lagos and beyond, Bizzare Fragrances makes it easy to order your favourite scents online and have them delivered to you. Nationwide delivery available.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brown-warm/20 text-brown-warm mb-3">
                <Truck className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Lagos Delivery</h3>
              <p className="mt-1 text-xs leading-5 text-cream-muted">24 to 48 hours doorstep courier service across all Lagos areas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brown-warm/20 text-brown-warm mb-3">
                <PackageCheck className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Nationwide Tracked</h3>
              <p className="mt-1 text-xs leading-5 text-cream-muted">2 to 4 business days to Abuja, Port Harcourt, and all Nigerian states.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FRAGRANCE CONSULTATION SECTION */}
      <section className="rounded-3xl border border-cream-border bg-cream-light p-8 sm:p-12 shadow-sm">
        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brown/20 bg-white px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brown">
              <Headphones className="h-3.5 w-3.5 text-brown-warm" />
              Complimentary Guidance
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
              Not Sure What to Wear?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brown-deep/80">
              Tell us the scents you already love, the occasion you&apos;re shopping for, or the kind of impression you want to make. We&apos;ll help you discover fragrances that match your style.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/customer-service"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-sm"
              >
                <span>Get Fragrance Guidance</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20help%20choosing%20a%20fragrance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-50 px-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm space-y-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brown-warm">
              How It Works
            </p>
            <ul className="space-y-3 text-xs leading-5 text-brown-deep/75">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brown/10 text-[10px] font-bold text-brown">1</span>
                <span>Share your favorite fragrance notes or perfume memories.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brown/10 text-[10px] font-bold text-brown">2</span>
                <span>Tell us your occasion (office signature, evening wear, or signature scent).</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brown/10 text-[10px] font-bold text-brown">3</span>
                <span>Receive tailored fragrance recommendations with full longevity & note breakdown.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9. FAQ PREVIEW SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
              Common Inquiries
            </p>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-brown-deep">
              Frequently Asked Questions
            </h2>
          </div>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brown hover:text-brown-hover transition-colors"
          >
            <span>View Full FAQ</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {HOMEPAGE_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-cream-border bg-white p-5 sm:p-6 shadow-sm transition-all hover:border-brown/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <h3 className="font-serif text-base font-bold text-brown-deep leading-snug">
                    {faq.question}
                  </h3>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-soft text-brown">
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-brown-deep/75 border-t border-cream-border/60 pt-3">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION (CTA) */}
      <section className="rounded-3xl border border-cream-border bg-gradient-to-r from-cream-light via-white to-cream-light p-8 sm:p-14 text-center shadow-card-soft">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-brown-warm">
            Your Next Signature
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brown-deep leading-tight">
            Find Your Signature Scent
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-brown-deep/75 max-w-xl mx-auto">
            Explore the Bizzare Fragrances collection and discover a scent that feels uniquely yours.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gold-gradient px-8 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep shadow-lg shadow-gold/30 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <span>Shop Fragrances</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/customer-service"
              className="inline-flex h-12 items-center rounded-xl border border-cream-border bg-white px-7 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep hover:border-brown transition-all"
            >
              <span>Talk to Us</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
