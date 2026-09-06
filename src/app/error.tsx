'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or monitoring service
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-brown-deep">
      <div className="max-w-md w-full bg-white border border-cream-border p-8 rounded-2xl shadow-card-soft space-y-6">
        {/* Error icon */}
        <div className="h-16 w-16 mx-auto rounded-full bg-red-50 flex items-center justify-center border border-red-200 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-serif font-extrabold text-brown-deep">System Interruption</h1>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            A temporary connection or build resource issue occurred. Please try reloading the page.
          </p>
        </div>

        {/* Action buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg bg-brown text-white hover:bg-brown-hover transition-colors shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg border border-brown text-brown hover:bg-cream-soft transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
