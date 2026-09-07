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
  Menu,
  X,
  Home,
  HelpCircle,
  Info,
  ArrowRight,
  MessageCircle,
  Instagram,
  Phone,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isAdminWorkspace = pathname.startsWith('/admin');

  // Close dropdown and mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCollectionClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === '/shop') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoutClick = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    onSignOut();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Home', href: '/', onClick: handleHomeClick, active: pathname === '/' },
    { label: 'Collection', href: '/shop', onClick: handleCollectionClick, active: pathname === '/shop' },
    { label: 'About', href: '/about', active: pathname === '/about' },
    { label: 'FAQ', href: '/faq', active: pathname === '/faq' },
    { label: 'Service', href: '/customer-service', active: pathname === '/customer-service', isService: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Trigger & Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          {!isAdminWorkspace && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-cream-light transition-colors hover:border-brown-warm hover:bg-white/10 hover:text-white md:hidden"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 text-brown-warm" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {/* Brand Logo & Monogram */}
          <Link href="/" onClick={handleHomeClick} className="group flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-brown-warm bg-brown-deep font-serif text-xs sm:text-sm font-bold tracking-widest text-brown-warm transition-transform group-hover:scale-105">
              BF
            </div>
            <div className="leading-none">
              <span className="block font-serif text-sm sm:text-base lg:text-lg font-bold tracking-[0.16em] sm:tracking-[0.18em] text-white">
                BIZZARE FRAGRANCES
              </span>
              <span className="mt-0.5 sm:mt-1 block text-[9px] sm:text-[10px] font-medium tracking-[0.18em] text-brown-warm">
                (by Bizzare)
              </span>
            </div>
          </Link>

          {/* Admin Studio Indicator */}
          {isAdminWorkspace && (
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brown-warm/40 bg-brown-deep px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-brown-warm shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Boutique Management Studio</span>
              </span>
            </div>
          )}
        </div>

        {/* Center: Desktop & Tablet Navigation Links (Visible on md and up >= 768px) */}
        {!isAdminWorkspace && (
          <nav className="hidden items-center gap-4 lg:gap-7 text-xs font-semibold uppercase tracking-[0.16em] md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={`relative py-1 transition-all ${
                  item.active
                    ? 'text-brown-warm font-bold'
                    : 'text-cream-muted hover:text-white'
                } ${item.isService ? 'inline-flex items-center gap-1.5' : ''}`}
              >
                {item.isService && <Headphones className="h-3.5 w-3.5 text-brown-warm" />}
                <span>{item.label}</span>
                {item.active && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-brown-warm" />
                )}
              </Link>
            ))}
          </nav>
        )}

        {/* Center-Right: Desktop/Tablet Search Bar */}
        {!isAdminWorkspace && (
          <form
            onSubmit={handleSearch}
            className="hidden max-w-[200px] lg:max-w-xs flex-1 items-center md:flex"
          >
            <div className="relative w-full">
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-brown-warm hover:text-white transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search perfumes"
                placeholder="Search perfumes..."
                className="h-9 w-full rounded-xl border border-white/15 bg-white/5 pl-8 pr-7 text-xs text-white placeholder:text-cream-muted/70 focus:border-brown-warm focus:bg-white/10 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search text"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-cream-muted hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right: Actions (Mobile Search, Account Dropdown, Cart Trigger) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick link to Storefront when inside admin studio */}
          {isAdminWorkspace && (
            <Link
              href="/shop"
              className="hidden items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cream-light transition-all hover:border-brown-warm hover:bg-white/10 hover:text-white sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brown-warm" />
              <span>Storefront View</span>
            </Link>
          )}

          {/* Mobile Search Toggle Button */}
          {!isAdminWorkspace && (
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-cream-light transition-colors hover:border-brown-warm hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Toggle search input"
            >
              <Search className="h-4 w-4 text-brown-warm" />
            </button>
          )}

          {/* Account Profile Dropdown (If Logged In) or Sign In Button (If Logged Out) */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl border border-white/15 bg-white/5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-cream-light transition-all hover:border-brown-warm hover:bg-white/10"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brown-warm/20 text-[10px] sm:text-[11px] font-bold text-brown-warm">
                  {currentUser.full_name[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">
                  {currentUser.full_name.split(' ')[0]}
                </span>
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
                        <span>Boutique Manager Studio</span>
                      </Link>
                    )}

                    <Link
                      href="/shop"
                      onClick={(e) => {
                        setIsUserMenuOpen(false);
                        handleCollectionClick(e);
                      }}
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
              className="flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-cream-muted transition-all hover:border-brown-warm hover:bg-white/10 hover:text-white"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brown-warm" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          {!isAdminWorkspace && (
            <button
              onClick={onOpenCart}
              className="relative flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-brown px-3 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-brown-hover shadow-sm"
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 flex h-[18px] min-w-[18px] sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-brown-warm px-1 text-[10px] font-bold text-black shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Expandable Drawer */}
      {isMobileSearchOpen && !isAdminWorkspace && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-3 md:hidden animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder="Search perfumes, notes, brands..."
                className="h-10 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-9 text-xs text-white placeholder:text-cream-muted focus:border-brown-warm focus:bg-white/10 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-cream-muted hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 rounded-xl bg-brown px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Luxury Full Mobile Navigation Drawer Menu */}
      {isMobileMenuOpen && !isAdminWorkspace && (
        <div
          ref={mobileMenuRef}
          className="border-t border-white/10 bg-black/95 px-4 py-6 md:hidden animate-in slide-in-from-top-3 duration-200 shadow-2xl"
        >
          {/* Mobile Search inside Drawer */}
          <form onSubmit={handleSearch} className="mb-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-warm" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search fragrance collection..."
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-9 text-xs text-white placeholder:text-cream-muted focus:border-brown-warm focus:bg-white/10 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-cream-muted hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 rounded-xl bg-brown px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover shrink-0"
            >
              Go
            </button>
          </form>

          {/* Primary Mobile Navigation Links */}
          <div className="space-y-1 border-b border-white/10 pb-5">
            <Link
              href="/"
              onClick={handleHomeClick}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                pathname === '/'
                  ? 'bg-brown text-white'
                  : 'text-cream-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="h-4 w-4 text-brown-warm" />
                <span>Home</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <Link
              href="/shop"
              onClick={handleCollectionClick}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                pathname === '/shop'
                  ? 'bg-brown text-white'
                  : 'text-cream-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-brown-warm" />
                <span>Collection</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                pathname === '/about'
                  ? 'bg-brown text-white'
                  : 'text-cream-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-brown-warm" />
                <span>About The House</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                pathname === '/faq'
                  ? 'bg-brown text-white'
                  : 'text-cream-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-brown-warm" />
                <span>FAQ & Orders</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <Link
              href="/customer-service"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                pathname === '/customer-service'
                  ? 'bg-brown text-white'
                  : 'text-cream-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Headphones className="h-4 w-4 text-brown-warm" />
                <span>Customer Care & Concierge</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          {/* Account / Auth Actions */}
          <div className="border-b border-white/10 py-5">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brown-warm text-black font-bold text-xs">
                    {currentUser.full_name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-sm font-bold text-white truncate">{currentUser.full_name}</p>
                    <p className="font-mono text-[10px] text-cream-muted truncate">{currentUser.email}</p>
                  </div>
                  <span className="rounded-md border border-brown-warm/40 bg-brown-deep px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-brown-warm shrink-0">
                    {currentUser.role}
                  </span>
                </div>

                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream-light hover:bg-white/10"
                >
                  <User className="h-4 w-4 text-brown-warm" />
                  <span>My Account & Orders</span>
                </Link>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brown-warm hover:bg-white/10"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Boutique Manager Studio</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/30 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brown px-4 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In or Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Direct Social Channels */}
          <div className="pt-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-cream-muted mb-3">
              Direct Contact Desk:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20would%20like%20to%20inquire%20about%20a%20fragrance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-900/40"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://instagram.com/bizzare_fragrances"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-950/30 px-3 py-1.5 text-[11px] font-medium text-pink-400 hover:bg-pink-900/40"
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram</span>
              </a>
              <a
                href="tel:09114743607"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-cream-light hover:bg-white/10"
              >
                <Phone className="h-3.5 w-3.5 text-brown-warm" />
                <span>0911 474 3607</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

