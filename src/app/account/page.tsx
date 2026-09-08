'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  LogOut,
  MapPin,
  PackageCheck,
  ShoppingBag,
  UserRound,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { OrderTracker } from '@/components/store/OrderTracker';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAuthenticated, isLoading, orders, signOut, verifyPayment, clearCart } = useStoreContext();

  const [paymentBanner, setPaymentBanner] = useState<{
    type: 'loading' | 'success' | 'error';
    message: string;
  } | null>(null);

  const processedRef = useRef<string | null>(null);
  const reference = searchParams.get('reference') ?? searchParams.get('tx_ref');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (!reference || processedRef.current === reference) return;
    processedRef.current = reference;

    setPaymentBanner({
      type: 'loading',
      message: 'Verifying your payment with Flutterwave...',
    });

    // Remove reference query parameter from URL immediately in browser
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/account');
    }

    verifyPayment(reference, transactionId)
      .then(() => {
        clearCart();
        setPaymentBanner({
          type: 'success',
          message: 'Payment confirmed successfully! Your luxury fragrance order is now being curated.',
        });
      })
      .catch((err) => {
        setPaymentBanner({
          type: 'error',
          message: err instanceof Error ? err.message : 'Payment verification could not be confirmed. Please check order status below.',
        });
      });
  }, [reference, transactionId, verifyPayment, clearCart]);

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center space-y-4 py-20 text-center text-brown-deep">
        <Loader2 className="h-10 w-10 animate-spin text-brown" />
        <p className="font-serif text-base font-bold">Accessing Your Account Profile...</p>
        <p className="text-xs font-mono text-brown-deep/60">Fetching order history and deliveries</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center text-brown-deep">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cream-border bg-white text-brown shadow-card-soft">
          <UserRound className="h-8 w-8 text-brown-warm" />
        </div>
        <h1 className="mt-5 font-serif text-3xl font-bold">Your account is waiting</h1>
        <p className="mt-3 text-sm leading-7 text-brown-deep/65">
          Sign in or create an account to manage orders, deliveries, and notifications.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-6 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md"
          >
            Sign in or create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter((order) => order.customer_id === currentUser.id);

  const notifications = userOrders.slice(0, 3).map((order) => ({
    id: order.id,
    title:
      order.status === 'delivered'
        ? 'Your order was delivered'
        : order.status === 'cancelled'
        ? 'Order was cancelled'
        : `Order ${order.status.replaceAll('_', ' ')}`,
    text: `Order #${order.id} is ${order.status.replaceAll('_', ' ')}.`,
  }));

  return (
    <div className="mx-auto max-w-6xl py-10 text-brown-deep sm:py-14">
      {/* Dynamic Payment Verification Notification Banner */}
      {paymentBanner && (
        <div
          className={`mb-8 flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-all ${
            paymentBanner.type === 'loading'
              ? 'border-brown/30 bg-brown/5 text-brown-deep'
              : paymentBanner.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
              : 'border-red-300 bg-red-50 text-red-900 shadow-sm'
          }`}
        >
          {paymentBanner.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-brown shrink-0" />}
          {paymentBanner.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          {paymentBanner.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
          <div className="flex-1">
            <p>{paymentBanner.message}</p>
          </div>
          <button
            onClick={() => setPaymentBanner(null)}
            className="text-xs uppercase font-mono tracking-wider opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-cream-border pb-7">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm">Account</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Hello, {currentUser.full_name.split(' ')[0]}.</h1>
          <p className="mt-2 text-sm text-brown-deep/65">Your orders, delivery updates, and account details.</p>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push('/');
          }}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-cream-border bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] hover:border-brown"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-cream-border bg-white p-6 shadow-card-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brown text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-xl font-bold">Profile</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown-deep/45">Name</dt>
                <dd className="mt-1 font-medium text-brown-deep">{currentUser.full_name}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown-deep/45">Email</dt>
                <dd className="mt-1 break-all font-medium text-brown-deep">{currentUser.email}</dd>
              </div>
              {currentUser.phone && (
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown-deep/45">Phone</dt>
                  <dd className="mt-1 font-medium text-brown-deep">{currentUser.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown-deep/45">Account Tier</dt>
                <dd className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-brown">
                  {currentUser.role} Account
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-cream-border bg-cream-light p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brown-warm" />
              <h2 className="font-serif text-xl font-bold">Notifications</h2>
            </div>
            {notifications.length ? (
              <div className="mt-4 space-y-3">
                {notifications.map((notice) => (
                  <div key={notice.id} className="border-l-2 border-brown-warm pl-3">
                    <p className="text-sm font-semibold">{notice.title}</p>
                    <p className="mt-1 text-xs leading-5 text-brown-deep/65">{notice.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-brown-deep/65">
                Delivery and order updates will appear here after you check out.
              </p>
            )}
          </section>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brown-warm">Orders and delivery</p>
              <h2 className="mt-1 font-serif text-3xl font-bold">Your perfume orders</h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-brown hover:text-brown-hover"
            >
              Shop perfumes <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {userOrders.length ? (
            <div className="mt-6 space-y-4">
              {userOrders.map((order) => (
                <OrderTracker key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-cream-border bg-white px-6 py-16 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-brown-warm" />
              <h3 className="mt-4 font-serif text-2xl font-bold">No orders yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brown-deep/65">
                When you place an order, its payment, packing, and delivery progress will all live here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-brown-hover shadow-md"
              >
                <ShoppingBag className="h-4 w-4" /> Shop the edit
              </Link>
            </div>
          )}
          <div className="mt-5 flex items-center gap-2 text-xs text-brown-deep/50">
            <MapPin className="h-4 w-4" /> Delivery destinations and contact details are shown inside each order.
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[55vh] flex-col items-center justify-center space-y-4 py-20 text-center text-brown-deep">
          <Loader2 className="h-10 w-10 animate-spin text-brown" />
          <p className="font-serif text-base font-bold">Loading Account...</p>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
