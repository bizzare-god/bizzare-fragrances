'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  CreditCard,
  XCircle,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useStoreContext } from '@/components/providers/StoreProvider';

interface OrderTrackerProps {
  order: Order;
}

export function OrderTracker({ order }: OrderTrackerProps) {
  const { initializePayment, cancelOrder } = useStoreContext();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Preparing Scent', icon: Sparkles },
    { key: 'shipped', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const statusOrderIndex: Record<string, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  const isCancelled = order.status === 'cancelled';
  const isPendingPayment = order.payment_status === 'pending' && !isCancelled;
  const currentIdx = statusOrderIndex[order.status] ?? 0;

  const handlePayNow = async () => {
    setActionError(null);
    setIsProcessingPayment(true);
    try {
      const res = await initializePayment(order.id);
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        throw new Error('Payment gateway did not return an authorization URL.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to initialize payment.');
      setIsProcessingPayment(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionError(null);
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to cancel the order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="emerald">DELIVERED</Badge>;
      case 'shipped':
        return <Badge variant="secondary">DISPATCHED</Badge>;
      case 'processing':
        return <Badge variant="amber">PREPARING SCENT</Badge>;
      case 'cancelled':
        return <Badge variant="red">CANCELLED</Badge>;
      default:
        return <Badge variant="default">ORDER PLACED</Badge>;
    }
  };

  return (
    <div className="rounded-2xl border border-cream-border bg-white p-6 shadow-card-soft space-y-6 text-brown-deep">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-border pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-brown">ORDER #{order.id.slice(-8).toUpperCase()}</span>
          <h3 className="text-lg font-serif font-bold text-brown-deep mt-0.5">
            {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? 'fragrance' : 'fragrances'}
          </h3>
          <p className="text-xs text-brown-deep/60 mt-0.5">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {order.payment_status === 'paid' ? (
              <Badge variant="emerald" className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold">
                Paid
              </Badge>
            ) : isCancelled ? (
              <Badge variant="default" className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold bg-neutral-200 text-neutral-700">
                Unpaid
              </Badge>
            ) : (
              <Badge variant="amber" className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold">
                Payment Pending
              </Badge>
            )}

            {getStatusBadge(order.status)}
          </div>

          <p className="text-base font-serif font-bold text-brown mt-1">
            {formatCurrency(order.total_amount)}
          </p>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Cancelled State Display */}
      {isCancelled ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-red-800 font-serif font-bold text-base">
            <XCircle className="h-5 w-5 text-red-600" />
            <span>Order Cancelled</span>
          </div>
          <p className="text-xs text-brown-deep/70 max-w-md mx-auto">
            This order has been cancelled and is no longer queued for fulfillment.
          </p>
        </div>
      ) : (
        /* Live Status Progress Bar */
        <div className="py-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-cream-border z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brown transition-all duration-500 z-0"
              style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                      isDone
                        ? 'bg-brown text-white border-brown shadow-sm font-bold'
                        : 'bg-white text-brown-deep/40 border-cream-border'
                    } ${isCurrent ? 'ring-4 ring-brown/20 scale-110' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[11px] font-mono mt-2 text-center max-w-[80px] ${
                      isDone ? 'text-brown font-bold' : 'text-brown-deep/45'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Payment Call-to-Action Bar */}
      {isPendingPayment && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider">
                Awaiting Secure Payment
              </p>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Complete checkout via Paystack to dispatch this fragrance collection for boutique preparation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isCancelling || isProcessingPayment}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-cream-border bg-white px-3 text-xs font-bold uppercase tracking-wider text-brown-deep/70 hover:text-red-700 hover:border-red-300 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
              <button
                onClick={handlePayNow}
                disabled={isProcessingPayment || isCancelling}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brown px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover disabled:opacity-60 shadow-sm"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Connecting Paystack...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Complete Payment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery & Items Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cream-border text-xs">
        <div className="space-y-1 p-3.5 rounded-xl bg-cream-soft border border-cream-border">
          <span className="text-brown font-mono uppercase text-[10px] block font-bold">Boutique Merchant</span>
          <p className="text-brown-deep font-bold text-sm">Bizzare Fragrances (by Bizzare)</p>
          <p className="text-brown-deep/65">
            Artisanal luxury perfumery & direct delivery.
          </p>
        </div>

        <div className="space-y-1 p-3.5 rounded-xl bg-cream-soft border border-cream-border">
          <span className="text-brown font-mono uppercase text-[10px] block font-bold">Destination</span>
          <p className="text-brown-deep font-bold text-sm truncate">{order.shipping_address}</p>
          <p className="text-brown-deep/65">
            Recipient Phone: <strong className="text-brown-deep">{order.phone}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
