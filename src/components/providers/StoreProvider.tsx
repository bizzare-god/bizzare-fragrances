'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer, CartItem } from '@/components/store/CartDrawer';
import { Product } from '@/types';

type StoreContextType = ReturnType<typeof useStore> & {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

const CART_STORAGE_KEY = 'bf_cart_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const pathname = usePathname();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hydrate cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved cart:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart, isInitialized]);

  const isAdminWorkspace = pathname.startsWith('/admin');

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.product.stock) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
      );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = async (address: string, phone: string, notes?: string) => {
    if (cart.length === 0) return;
    const result = await store.placeOrder({
      items: cart,
      shipping_address: address,
      phone,
      notes,
    });

    if (result.payment?.authorization_url) {
      clearCart();
      window.location.href = result.payment.authorization_url;
      return;
    }

    throw new Error('Payment authorization URL was not generated. Please try again.');
  };

  return (
    <StoreContext.Provider
      value={{
        ...store,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      <div className="min-h-screen flex flex-col bg-cream-soft text-brown-deep font-sans selection:bg-brown-warm selection:text-white">
        {/* Dynamic Contextual Navbar */}
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          currentUser={store.currentUser}
          onSignOut={store.signOut}
        />

        {/* Main Workspace / Storefront Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {children}
        </main>

        {/* Public Storefront Footer */}
        {!isAdminWorkspace && <Footer />}

        {/* Shopping Cart Drawer */}
        {!isAdminWorkspace && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckoutSubmit}
          />
        )}
      </div>
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}
