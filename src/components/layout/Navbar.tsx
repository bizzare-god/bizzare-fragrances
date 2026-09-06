'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Headphones,
  Search,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Package,
  ExternalLink,
} from 'lucide-react';
import { Profile } from '@/types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currentUser?: Profile | null;
  onSignOut: () => void;
}

export function Navbar({ cartCount, onOpenCart, currentUser, onSignOut }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdminWorkspace = pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}#shop` : '/shop#shop');
  };

  const handleLogoutClick = async () => {
    setIsUserMenuOpen(false);
    onSignOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brown-dark/50 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-brown-warm bg-brown-deep font-serif text-sm font-bold tracking-widest text-brown-warm transition-transform group-hover:scale-105">
              BF
            </div>
            <div className="leading-none">
              <span className="block font-serif text-base font-bold tracking-[0.18em] text-white sm:text-lg">
                BIZZARE FRAGRANCES
              </span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-brown-warm">
                (by Bizzare)
              </span>
            </div>
          </Link>

          {/* Admin Studio Badge */}
          {isAdminWorkspace && (
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brown-warm/40 bg-brown-deep px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-brown-warm shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Boutique Management Studio</span>
              </span>
            </div>
          )}
        </div>

        {/* Public Storefront Navigation Links */}
        {!isAdminWorkspace && (
          <nav className="hidden items-center gap-7 text-xs font-medium uppercase tracking-[0.16em] text-cream-muted lg:flex">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Link href="/shop" className="transition-colors hover:text-white">Collection</Link>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/faq" className="transition-colors hover:text-white">FAQ</Link>
            <Link href="/customer-service" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <Headphones className="h-3.5 w-3.5 text-brown-warm" />
              Service
            </Link>
          </nav>
        )}

        {/* Search Bar */}
        {!isAdminWorkspace && (
          <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 items-center md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search perfumes"
                placeholder="Search perfumes or notes"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-cream-muted focus:border-brown-warm focus:bg-white/10 focus:outline-none"
              />
            </div>
          </form>
        )}

        {/* Actions (Account Dropdown & Optional Cart) */}
        <div className="flex items-center gap-3">
          {/* Quick link to Storefront when inside admin studio */}
          {isAdminWorkspace && (
            <Link
              href="/shop"
              className="hidden items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cream-light transition-all hover:border-brown-warm hover:bg-white/10 hover:text-white sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brown-warm" />
              <span>Storefront View</span>
            </Link>
          )}

          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-cream-light transition-all hover:border-brown-warm hover:bg-white/10"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brown-warm/20 text-[10px] font-bold text-brown-warm">
                  {currentUser.full_name[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.full_name.split(' ')[0]}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-brown-warm transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/15 bg-black/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {/* User Profile Header */}
                  <div className="border-b border-white/10 p-3">
                    <p className="font-serif text-sm font-bold text-white truncate">{currentUser.full_name}</p>
                    <p className="font-mono text-[11px] text-cream-muted truncate mt-0.5">{currentUser.email}</p>
                    <div className="mt-2.5">
                      <span className="inline-block rounded-md border border-brown-warm/40 bg-brown-deep px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brown-warm">
                        {currentUser.role === 'admin' ? 'Boutique Owner' : 'Client Account'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1 py-2">
                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-cream-light hover:bg-white/10 hover:text-white"
                    >
                      <User className="h-4 w-4 text-brown-warm" />
                      <span>My Account & Orders</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-cream-light hover:bg-white/10 hover:text-white"
                      >
                        <Sparkles className="h-4 w-4 text-brown-warm" />
                        <span>Boutique Manager</span>
                      </Link>
                    )}

                    <Link
                      href="/shop"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-cream-light hover:bg-white/10 hover:text-white"
                    >
                      <Package className="h-4 w-4 text-cream-muted" />
                      <span>Explore Collection</span>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-muted transition-all hover:border-brown-warm hover:bg-white/10 hover:text-white"
            >
              <User className="h-4 w-4 text-brown-warm" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Cart Trigger */}
          {!isAdminWorkspace && (
            <button
              onClick={onOpenCart}
              className="relative flex h-10 items-center gap-2 rounded-lg bg-brown px-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-brown-hover shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brown-warm px-1 text-[10px] font-bold text-black shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {!isAdminWorkspace && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream-muted">
            <Link href="/">Home</Link>
            <Link href="/shop">Collection</Link>
            <Link href="/about">About</Link>
            <Link href="/customer-service">Service</Link>
            {currentUser ? (
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1 font-bold text-red-400"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            ) : (
              <Link href="/login">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
