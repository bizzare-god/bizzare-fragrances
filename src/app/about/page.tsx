import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Headphones,
  Instagram,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Bizzare Fragrances | Bizarre Perfumes Boutique',
  description:
    'About Bizzare (Bizarre) Fragrances: an artisanal perfumery curating 100% genuinely authentic Bizzare perfumes and Bizarre Fragrances — luxury, niche, and designer scents delivered nationwide in Nigeria.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:py-16 text-brown-deep">
      {/* Brand Hero Story */}
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">
          About The House
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          A quieter way to experience authentic luxury perfume.
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-brown-deep/80">
          <p>
            <strong>Bizzare Fragrances (by Bizzare)</strong> curates and imports 100% genuine, authentic luxury, niche, and designer fragrances directly from prestigious perfume houses and certified distributors across France, the UAE / Middle East, Italy, the UK, and beyond.
          </p>
          <p>
            Our collection is strictly edited around concentrated, memorable scents: pure oud, velvet Damask rose, smoked amber, radiant Mediterranean citrus, rich bourbon vanilla, sacred woods, and clean skin musks.
          </p>
          <p>
            We believe in direct simplicity for our clients: an unhurried browsing experience, complete olfactory note clarity, secure Flutterwave checkout, and boutique-direct fulfillment with real-time tracking to doorsteps nationwide across Nigeria.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brown px-6 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md transition-all"
          >
            <span>Explore Collection</span>
            <ShoppingBag className="h-4 w-4" />
          </Link>
          <Link
            href="/customer-service"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-cream-border bg-white px-6 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep hover:border-brown transition-all"
          >
            <Headphones className="h-4 w-4 text-brown-warm" />
            <span>Consult Concierge</span>
          </Link>
        </div>
      </div>

      {/* Brand Core Pillars */}
      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brown/10 text-brown mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg font-bold text-brown-deep">100% Genuine Imports</h2>
          <p className="mt-2 text-xs leading-6 text-brown-deep/70">
            Every bottle is original, factory sealed, and directly sourced from verified international perfume houses.
          </p>
        </div>

        <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brown/10 text-brown mb-4">
            <Truck className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg font-bold text-brown-deep">Nationwide Tracked Dispatch</h2>
          <p className="mt-2 text-xs leading-6 text-brown-deep/70">
            Direct doorstep courier delivery across Lagos (24-48h) and all Nigerian states with live order status updates.
          </p>
        </div>

        <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brown/10 text-brown mb-4">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg font-bold text-brown-deep">Bespoke Curation</h2>
          <p className="mt-2 text-xs leading-6 text-brown-deep/70">
            Personal scent advice, notes breakdown, and custom recommendations from our concierge specialists.
          </p>
        </div>
      </div>

      {/* Direct Contact & Social Connect Desk */}
      <div className="mt-14 rounded-3xl border border-cream-border bg-cream-light p-6 sm:p-10 shadow-card-soft">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-brown">
          <Headphones className="h-4 w-4" />
          <span>Direct Contact & Social Desk</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-brown-deep">
          Connect With Bizzare Fragrances
        </h2>
        <p className="mt-2 text-sm text-brown-deep/70 max-w-xl">
          For fast inquiries, bespoke perfume consultations, or instant delivery updates, reach out to us directly across our official channels:
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20to%20inquire%20about%20a%20fragrance"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-emerald-600/25 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Instant Reply
                </span>
              </div>
              <h3 className="mt-3 font-serif text-base font-bold text-brown-deep group-hover:text-emerald-700 transition-colors">
                WhatsApp Direct
              </h3>
              <p className="mt-0.5 font-mono text-xs text-brown-deep/70">+234 911 474 3607</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <span>Chat in WhatsApp</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </a>

          {/* Instagram Direct */}
          <a
            href="https://instagram.com/bizzare_fragrances"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-pink-600/25 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pink-600 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <Instagram className="h-4 w-4" />
                </div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                  Official Page
                </span>
              </div>
              <h3 className="mt-3 font-serif text-base font-bold text-brown-deep group-hover:text-pink-700 transition-colors">
                Instagram Page & DM
              </h3>
              <p className="mt-0.5 font-mono text-xs text-brown-deep/70">@bizzare_fragrances</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-pink-700">
              <span>Open Instagram</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </a>

          {/* Phone Line Direct */}
          <a
            href="tel:09114743607"
            className="group flex flex-col justify-between rounded-2xl border border-cream-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brown hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-soft text-brown">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-brown-warm bg-cream-soft px-2 py-0.5 rounded-full">
                  Direct Line
                </span>
              </div>
              <h3 className="mt-3 font-serif text-base font-bold text-brown-deep group-hover:text-brown transition-colors">
                Phone Call
              </h3>
              <p className="mt-0.5 font-mono text-xs text-brown-deep/70">0911 474 3607</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brown">
              <span>Call Boutique Desk</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

