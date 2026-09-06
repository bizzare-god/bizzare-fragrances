import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { orderDto } from '@/lib/serializers';
import { orderInclude } from '@/lib/orders';
import { recordAuditLog } from '@/lib/audit';

const statuses = new Set(Object.values(OrderStatus));

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can update order fulfillment status.' }, { status: 403 });
    }

    const body = await request.json();
    const status = typeof body.status === 'string' ? (body.status.toUpperCase() as OrderStatus) : null;
    if (!status || !statuses.has(status)) {
      return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
      include: orderInclude,
    });

    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'Order',
      targetId: updated.id,
      details: {
        previousStatus: order.status,
        newStatus: updated.status,
      },
    });

    return NextResponse.json({ order: orderDto(updated) });
  } catch (error) {
    console.error('Error in status update:', error);
    return NextResponse.json({ error: 'Unable to update the order.' }, { status: 500 });
  }
}
