'use client';

import React, { useEffect } from 'react';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const {
    currentUser,
    profiles,
    products,
    orders,
    isLoading,
    fetchAdminData,
    updateProfileRole,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
  } = useStoreContext();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      void fetchAdminData();
    }
  }, [currentUser?.role, fetchAdminData]);

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center space-y-4 py-20 text-center text-brown-deep">
        <Loader2 className="h-10 w-10 animate-spin text-brown" />
        <p className="font-serif text-base font-bold">Connecting to Boutique Studio...</p>
        <p className="text-xs font-mono text-brown-deep/60">Loading Bizzare Fragrances inventory & orders</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg py-20 text-center text-brown-deep">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brown-warm/40 bg-brown-deep text-brown-warm shadow-card-soft">
          <Sparkles className="h-8 w-8 text-brown-warm" />
        </div>
        <h2 className="mt-5 font-serif text-3xl font-bold text-brown-deep">Boutique Management Sign-In Required</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brown-deep/65">
          This studio is reserved for Bizzare Fragrances boutique management.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-brown-hover shadow-md"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center rounded-xl border border-cream-border bg-white px-5 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep hover:border-brown"
          >
            Return to collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardView
      profiles={profiles}
      products={products}
      orders={orders}
      onUpdateRole={updateProfileRole}
      onAddProduct={addProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
      onUpdateOrderStatus={updateOrderStatus}
    />
  );
}
