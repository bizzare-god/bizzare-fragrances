'use client';

import React, { useEffect, useRef, useState } from 'react';

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const hms = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${hms}` : hms;
}

interface CountdownTimerProps {
  target: string;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ target, onExpire, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const rem = Math.max(0, new Date(target).getTime() - Date.now());
      setRemaining(rem);
      if (rem === 0) {
        clearInterval(interval);
        if (!firedRef.current) {
          firedRef.current = true;
          onExpire?.();
        }
      }
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target, onExpire]);

  return <span className={className}>{formatRemaining(remaining)}</span>;
}

export function isDiscountActiveNow(product: {
  sale_ends_at?: string;
  original_price?: number;
  discount_percent?: number | null;
}): boolean {
  if (!product.sale_ends_at || !product.original_price || !product.discount_percent) return false;
  return new Date(product.sale_ends_at).getTime() > Date.now();
}