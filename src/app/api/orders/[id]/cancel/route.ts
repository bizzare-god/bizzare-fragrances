import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { orderDto } from '@/lib/serializers';
import { recordAuditLog } from '@/lib/audit';
import { orderInclude } from '@/lib/orders';
import { invalidateProductCache } from '@/lib/cache';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: orderInclude,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const isBuyer = order.buyerId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isBuyer && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorized to cancel this order.' }, { status: 403 });
    }

    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json({ error: 'This order has already been cancelled.' }, { status: 400 });
    }

    if (order.status === OrderStatus.DELIVERED) {
      return NextResponse.json({ error: 'Delivered orders cannot be cancelled.' }, { status: 400 });
    }

    // Buyers can cancel when pending or processing, but not after dispatch
    const isShipped = (order.status as string) === 'SHIPPED';
    if (isBuyer && !isAdmin && isShipped) {
      return NextResponse.json(
        { error: 'Shipped orders cannot be cancelled directly. Please contact support.' },
        { status: 400 }
      );
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // If order was paid, restore deducted stock
      if (order.paymentStatus === PaymentStatus.PAID) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
        include: orderInclude,
      });

      return updated;
    });

    invalidateProductCache();

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'CANCEL_ORDER',
      targetType: 'Order',
      targetId: cancelledOrder.id,
      details: {
        previousStatus: order.status,
        previousPaymentStatus: order.paymentStatus,
        reason: isBuyer ? 'Cancelled by buyer' : 'Cancelled by administrator',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: orderDto(cancelledOrder),
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Unable to cancel the order.' }, { status: 500 });
  }
}
