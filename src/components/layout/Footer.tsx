import React from 'react';
import Link from 'next/link';
import { Headphones, Mail, ShieldCheck, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-brown-dark/40 bg-black text-cream-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
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
          <p className="mt-4 max-w-md text-sm leading-7">
            Rare perfumes, quiet service, secure checkout, and delivery updates for buyers who want the bottle without the noise.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Mail className="h-3.5 w-3.5 text-brown-warm" />
            <span>concierge@bizzarefragrances.shop</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Customer Care</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white">Shop perfumes</Link></li>
            <li><Link href="/customer-service" className="hover:text-white">Customer service</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/about" className="hover:text-white">About Bizzare Fragrances</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">Buyer Promise</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brown-warm" /> Secure Paystack checkout</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brown-warm" /> Order tracking after purchase</li>
            <li className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brown-warm" /> Concierge support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream-muted">
        Copyright 2026 Bizzare Fragrances (by Bizzare).
      </div>
    </footer>
  );
}
