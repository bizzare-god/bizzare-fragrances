'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Advert } from '@/types';
import { Megaphone, Clock } from 'lucide-react';
import { CountdownTimer } from '@/components/store/CountdownTimer';

export function PromoBanner() {
  const [adverts, setAdverts] = useState<Advert[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/adverts', { cache: 'no-store' })
      .then((res) => res.json().catch(() => ({ adverts: [] })))
      .then((data) => {
        if (mounted && Array.isArray(data?.adverts) && data.adverts.length > 0) {
          setAdverts(data.adverts);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (adverts.length === 0) return null;

  return (
    <div className="relative z-40 w-full overflow-hidden bg-gradient-to-r from-black via-brown-espresso to-brown-deep text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
        {adverts.map((advert) => (
          <div
            key={advert.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="h-4 w-4 shrink-0 text-brown-warm" />
              <span className="font-serif font-bold tracking-wide truncate">{advert.title}</span>
              {advert.description && (
                <span className="max-w-xl truncate text-cream-muted hidden sm:inline">{advert.description}</span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                <Clock className="h-3 w-3" />
                Ends <CountdownTimer target={advert.ends_at} />
              </span>
              {advert.link_url && (
                <Link
                  href={advert.link_url}
                  className="rounded-full bg-brown-warm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm transition-colors hover:bg-cream-light"
                >
                  {advert.button_text || 'Shop Now'}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}