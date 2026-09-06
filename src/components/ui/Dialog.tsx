'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'relative w-full rounded-2xl border border-cream-border bg-white text-brown-deep p-6 sm:p-8 shadow-2xl transition-all max-h-[88vh] flex flex-col',
          maxWidth
        )}
      >
        {/* Pinned Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-brown-deep/50 hover:bg-cream-soft hover:text-brown-deep transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Pinned Modal Header */}
        <div className="mb-4 pr-10 shrink-0 border-b border-cream-border pb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brown-deep">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-brown-deep/65 mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-2 -mr-2 flex-1 scrollbar-thin scrollbar-thumb-brown/20 hover:scrollbar-thumb-brown/40">
          {children}
        </div>
      </div>
    </div>
  );
}
