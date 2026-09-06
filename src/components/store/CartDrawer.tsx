'use client';

import React, { useState } from 'react';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react';
import { Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (address: string, phone: string, notes?: string) => Promise<void>;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckoutSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!address || !phone) return;

    setCheckoutError('');
    setIsPlacing(true);
    void onCheckout(address, phone, notes)
      .then(() => {
        setIsPlacing(false);
        onClose();
      })
      .catch((error) => {
        setCheckoutError(error instanceof Error ? error.message : 'Unable to create the order.');
        setIsPlacing(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-6">
        <div className="flex w-screen max-w-md flex-col border-l border-brown-dark bg-cream-light text-brown-deep shadow-2xl">
          <div className="flex items-center justify-between border-b border-cream-border bg-white px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-brown-warm font-mono font-bold">Boutique Cart</p>
              <h2 className="font-serif text-xl font-bold">Your Selection</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-border text-brown hover:border-brown hover:bg-cream-soft"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-brown-warm" />
                <h3 className="mt-4 font-serif text-2xl font-bold">Your selection is empty</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-brown-deep/65">
                  Explore our fragrance creations and add your chosen bottles.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-xl border border-cream-border bg-white p-3 shadow-sm">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-[72px] w-[72px] rounded-lg object-cover border border-cream-border" />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-cream-soft text-center text-[10px] text-brown-deep/50">
                      Bottle Image
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="truncate font-serif text-base font-bold text-brown-deep">{product.name}</h4>
                    <p className="text-xs font-mono text-brown-warm">
                      {product.volume_ml}ml • {product.scent_family}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brown">{formatCurrency(product.price)}</p>
                    <p className="mt-0.5 text-[11px] text-brown-deep/55">{product.stock} available</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="text-brown-deep/40 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center rounded-lg border border-cream-border bg-cream-soft/50">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        aria-label={`Decrease ${product.name} quantity`}
                        className="flex h-7 w-7 items-center justify-center hover:bg-cream-soft text-brown-deep font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold font-mono">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        aria-label={`Increase ${product.name} quantity`}
                        disabled={quantity >= product.stock}
                        className="flex h-7 w-7 items-center justify-center hover:bg-cream-soft text-brown-deep font-bold disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-3 border-t border-cream-border bg-white px-5 py-5 shadow-inner">
              <Input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                placeholder="Delivery address in Nigeria"
              />
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                placeholder="Recipient phone number (e.g. 08012345678)"
              />
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Delivery instructions (optional)"
              />

              {checkoutError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{checkoutError}</p>
              )}

              <div className="flex items-center justify-between border-t border-cream-border pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-serif text-2xl font-bold text-brown">{formatCurrency(total)}</span>
              </div>

              <button
                type="submit"
                disabled={isPlacing}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brown px-5 text-sm font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover disabled:opacity-60 shadow-md transition-all"
              >
                <span>{isPlacing ? 'Initializing Paystack...' : 'Checkout with Paystack'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-xs text-brown-deep/55">
                <ShieldCheck className="h-3.5 w-3.5 text-brown" />
                Direct Boutique Fulfillment & Paystack Checkout (NGN)
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
