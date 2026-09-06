import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { initializePaystackTransaction } from '@/lib/paystack';
import { invalidateProductCache } from '@/lib/cache';
import { recordAuditLog } from '@/lib/audit';
import { sendOrderConfirmationEmail } from '@/lib/email';

export const orderInclude = {
  buyer: true,
  items: { include: { product: true } },
} as const;

export interface InitializePaymentParams {
  orderId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  host?: string;
  protocol?: string;
}

export async function initializeOrderPayment({
  orderId,
  user,
  host = 'localhost:3000',
  protocol = 'http',
}: InitializePaymentParams) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { buyer: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    throw new Error('This order has already been paid.');
  }

  const reference = order.paymentReference || `bf_${order.id.slice(-8)}_${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const callbackUrl = `${baseUrl.replace(/\/+$/, '')}/account?reference=${reference}`;

  const paystackResult = await initializePaystackTransaction({
    email: order.buyer.email || user.email,
    amount: Number(order.totalAmount),
    reference,
    callbackUrl,
    metadata: {
      orderId: order.id,
      buyerId: user.id,
      buyerName: user.name,
    },
  });

  if (!paystackResult.status || !paystackResult.data) {
    throw new Error(paystackResult.message || 'Failed to initialize payment gateway.');
  }

  // Update order references in database
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentReference: reference,
      paystackReference: paystackResult.data.reference,
    },
  });

  return {
    authorization_url: paystackResult.data.authorization_url,
    access_code: paystackResult.data.access_code,
    reference: paystackResult.data.reference,
  };
}

export interface MarkOrderPaidMeta {
  reference: string;
  amountKobo?: number;
  channel?: string;
  paidAt?: Date;
  actorId?: string;
  actorName?: string;
  actionSource?: string;
}

export async function markOrderPaid(orderIdOrRef: string, meta: MarkOrderPaidMeta) {
  // Find order by ID or payment reference
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdOrRef },
        { paymentReference: orderIdOrRef },
        { paystackReference: orderIdOrRef },
        { paymentReference: meta.reference },
        { paystackReference: meta.reference },
      ],
    },
    include: orderInclude,
  });

  if (!order) {
    throw new Error('Order not found for this payment reference.');
  }

  // Verify amount matches expected order total if amountKobo provided
  if (meta.amountKobo !== undefined && meta.amountKobo > 0) {
    const expectedKobo = Math.round(Number(order.totalAmount) * 100);
    if (Math.abs(meta.amountKobo - expectedKobo) >= 100) {
      console.warn(
        `Payment amount mismatch for order ${order.id}: expected ${expectedKobo} kobo, received ${meta.amountKobo} kobo.`
      );
      throw new Error('Payment amount verification mismatch.');
    }
  }

  // If already marked as PAID, return idempotently
  if (order.paymentStatus === PaymentStatus.PAID) {
    return { order, alreadyPaid: true };
  }

  // Atomic conditional update using Prisma transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { not: PaymentStatus.PAID },
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
        paidAt: meta.paidAt || new Date(),
      },
    });

    if (result.count === 0) {
      return await tx.order.findUnique({
        where: { id: order.id },
        include: orderInclude,
      });
    }

    // Decrement inventory with stock >= quantity floor guard
    for (const item of order.items) {
      await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return await tx.order.findUnique({
      where: { id: order.id },
      include: orderInclude,
    });
  });

  if (!updatedOrder) {
    throw new Error('Failed to retrieve updated order.');
  }

  // Clear product cache so updated stock reflects immediately
  invalidateProductCache();

  await recordAuditLog({
    actorId: meta.actorId,
    actorName: meta.actorName || 'Paystack Gateway',
    action: meta.actionSource || 'PAYMENT_VERIFIED',
    targetType: 'Order',
    targetId: updatedOrder.id,
    details: {
      reference: meta.reference,
      amount: Number(updatedOrder.totalAmount),
      paymentStatus: updatedOrder.paymentStatus,
      channel: meta.channel,
    },
  });

  // Dispatch branded order confirmation receipt asynchronously via Resend
  if (updatedOrder.buyer?.email) {
    sendOrderConfirmationEmail({
      email: updatedOrder.buyer.email,
      name: updatedOrder.buyer.name || 'Client',
      orderId: updatedOrder.id,
      totalAmount: Number(updatedOrder.totalAmount),
      shippingAddress: updatedOrder.shippingAddress || 'Standard Delivery',
      items: updatedOrder.items.map((it) => ({
        name: it.product?.name || 'Fragrance',
        quantity: it.quantity,
        price: Number(it.priceAtPurchase),
      })),
    }).catch((err) => console.error('[Order Confirmation Email Error]:', err));
  }

  return { order: updatedOrder, alreadyPaid: false };
}
