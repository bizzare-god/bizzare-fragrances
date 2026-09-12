'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Advert } from '@/types';
import { Megaphone, Clock, ArrowRight } from 'lucide-react';
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
    <section aria-label="Promotions" className="relative z-20 space-y-3">
      {adverts.map((advert) => (
        <div
          key={advert.id}
          className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-brown-espresso via-brown-deep to-brown-espresso text-white shadow-lg shadow-black/20"
        >
          {/* Gold accent edge */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gold-gradient" />

          <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold ring-1 ring-gold/40">
                <Megaphone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-serif text-lg font-extrabold leading-tight tracking-wide sm:text-xl lg:text-2xl">
                  {advert.title}
                </p>
                {advert.description && (
                  <p className="mt-0.5 hidden max-w-2xl truncate text-xs leading-relaxed text-cream-light/75 sm:block">
                    {advert.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/40 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur">
                <Clock className="h-3.5 w-3.5" />
                Ends in <CountdownTimer target={advert.ends_at} />
              </span>
              {advert.link_url && (
                <Link
                  href={advert.link_url}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gold-gradient px-4 text-[10px] font-bold uppercase tracking-wider text-brown-deep shadow-md shadow-gold/30 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  {advert.button_text || 'Shop Now'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}