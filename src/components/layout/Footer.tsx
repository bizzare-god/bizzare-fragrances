import React from 'react';
import Link from 'next/link';
import { Headphones, Instagram, Mail, MessageCircle, Phone, ShieldCheck, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-brown-dark/40 bg-black text-cream-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-brown-warm bg-brown-deep font-serif text-sm font-bold text-white">
              BF
            </div>
            <div className="leading-none">
              <span className="block font-serif text-base font-bold tracking-[0.18em] text-white">BIZZARE FRAGRANCES</span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-brown-warm">(by Bizzare)</span>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-6 text-cream-muted/80">
            Artisanal haute parfumerie, pure extraits, secure Paystack checkout, and boutique-direct fulfillment across Nigeria.
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

        {/* Direct Connect / Social Channels */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Direct Connect</h4>
          <ul className="mt-4 space-y-2.5 text-xs">
            <li>
              <a
                href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20to%20inquire%20about%20a%20fragrance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: +234 911 474 3607</span>
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/bizzare_fragrances"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram: @bizzare_fragrances</span>
              </a>
            </li>
            <li>
              <a
                href="tel:09114743607"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-brown-warm" />
                <span>Call: 0911 474 3607</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Customer Care</h4>
          <ul className="mt-4 space-y-2 text-xs">
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop perfumes</Link></li>
            <li><Link href="/customer-service" className="hover:text-white transition-colors">Customer service</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Bizzare Fragrances</Link></li>
          </ul>
        </div>

        {/* Buyer Promise */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Buyer Promise</h4>
          <ul className="mt-4 space-y-3 text-xs">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brown-warm shrink-0" /> Secure Paystack checkout</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brown-warm shrink-0" /> Tracked boutique fulfillment</li>
            <li className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brown-warm shrink-0" /> Concierge scent guidance</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream-muted">
        Copyright 2026 Bizzare Fragrances (by Bizzare). All rights reserved.
      </div>
    </footer>
  );
}
