import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShoppingBag, HelpCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | Bizzare Fragrances',
  description:
    'The page you are looking for could not be found. Explore original imported perfumes in Nigeria at Bizzare Fragrances.',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center text-brown-deep">
      <div className="max-w-md w-full bg-white border border-cream-border p-8 rounded-2xl shadow-card-soft space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-cream-soft flex items-center justify-center border border-cream-border">
          <Phone className="h-8 w-8 text-brown animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-extrabold text-brown-deep">404</h1>
          <h2 className="text-lg font-serif font-bold text-brown">Fragrance Page Not Found</h2>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            The page you are looking for does not exist or has been moved. Browse our original
            imported perfume collection instead.
          </p>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
          <Link
            href="/shop"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg bg-brown text-white hover:bg-brown-hover transition-colors shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Go to Shop</span>
          </Link>
          <Link
            href="/customer-service"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg border border-brown text-brown hover:bg-cream-soft transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help Center</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-cream-border flex items-center justify-center space-x-2 text-[11px] font-mono text-gray-500">
          <ShoppingBag className="h-3.5 w-3.5 text-brown" />
          <Link href="/perfumes" className="text-brown hover:underline">
            Browse Perfume Categories
          </Link>
        </div>
      </div>
    </div>
  );
}