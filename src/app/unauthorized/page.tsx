import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="py-24 text-center space-y-6 max-w-lg mx-auto">
      <div className="h-20 w-20 mx-auto rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-gold-glow">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-brown-deep">Access denied</h1>
      <p className="text-brown-deep/65 text-sm leading-relaxed">
        Your account does not have permission to view this page.
      </p>
      <div className="pt-4">
        <Link
          href="/shop"
          className="bg-brown text-white font-bold px-6 py-3 text-sm"
        >
          Return to shop
        </Link>
      </div>
    </div>
  );
}
