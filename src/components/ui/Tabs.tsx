'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5 rounded-xl bg-black/90 p-1.5 border border-white/10 shadow-card-soft backdrop-blur-md', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center space-x-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-brown to-brown-warm text-white font-bold shadow-md ring-1 ring-white/20'
                : 'text-cream-muted hover:text-white hover:bg-white/5'
            )}
          >
            {tab.icon && <span className={cn(isActive ? 'text-white' : 'text-brown-warm')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-bold',
                  isActive ? 'bg-black/40 text-cream-light' : 'bg-white/10 text-cream-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
