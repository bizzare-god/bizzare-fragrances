import React from 'react';
import Link from 'next/link';
import { Headphones, Instagram, Mail, MessageCircle, Phone, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { FAMILY_SLUGS, FAMILY_NAME } from '@/lib/seo';

export function Footer() {
  return (
    <footer className="border-t border-brown-dark/40 bg-black text-cream-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-brown-warm bg-brown-deep font-serif text-sm font-bold text-white">
              BF
            </div>
            <div className="leading-none">
              <span className="block font-serif text-base font-bold tracking-[0.18em] text-white">BIZZARE FRAGRANCES</span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-brown-warm">Original Imported Perfumes</span>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-6 text-cream-muted/80">
            100% original imported perfumes in Nigeria. Curated designer, luxury, and niche fragrances with secure checkout and express nationwide delivery.
          </p>
          <div className="mt-5 space-y-2 text-xs">
            <a
              href="mailto:concierge@bizzarefragrances.shop"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-brown-warm shrink-0" />
              <span>concierge@bizzarefragrances.shop</span>
            </a>
            <a
              href="tel:09114743607"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-brown-warm shrink-0" />
              <span>0911 474 3607</span>
            </a>
          </div>
        </div>

        {/* Fragrance Categories Column */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Perfume Categories</h4>
          <ul className="mt-4 space-y-2 text-xs">
            {FAMILY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/perfumes/${slug}`}
                  className="hover:text-white transition-colors"
                >
                  {FAMILY_NAME[slug]} Perfumes
                </Link>
              </li>
            ))}
            <li>
              <Link href="/perfumes" className="text-brown-warm hover:underline">
                All Categories →
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Customer Care</h4>
          <ul className="mt-4 space-y-2 text-xs">
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop All Perfumes</Link></li>
            <li><Link href="/customer-service" className="hover:text-white transition-colors">Customer Service Desk</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Bizzare Fragrances</Link></li>
          </ul>
          <div className="mt-6 pt-4 border-t border-white/10">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-cream-light mb-2">Direct WhatsApp</h5>
            <a
              href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20to%20inquire%20about%20a%20fragrance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>+234 911 474 3607</span>
            </a>
          </div>
        </div>

        {/* Buyer Promise */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Buyer Promise</h4>
          <ul className="mt-4 space-y-3 text-xs">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brown-warm shrink-0" /> 100% Genuine Guaranteed</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brown-warm shrink-0" /> Secure Flutterwave checkout</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brown-warm shrink-0" /> Tracked nationwide delivery</li>
            <li className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brown-warm shrink-0" /> Concierge scent guidance</li>
          </ul>
          <div className="mt-5 space-y-2 text-xs">
            <a
              href="https://instagram.com/bizzare_fragrances"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              <Instagram className="h-4 w-4" />
              <span>@bizzare_fragrances</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream-muted">
        Copyright 2026 Bizzare Fragrances. Original Imported Perfumes in Nigeria. All rights reserved.
      </div>
    </footer>
  );
}
