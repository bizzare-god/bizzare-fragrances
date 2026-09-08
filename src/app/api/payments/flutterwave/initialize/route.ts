import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { initializeOrderPayment } from '@/lib/orders';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Sign in is required to initialize payment.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId = typeof body.order_id === 'string' ? body.order_id.trim() : '';

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.buyerId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'You are not authorized to pay for this order.' }, { status: 403 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    const paymentResult = await initializeOrderPayment({
      orderId: order.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      host,
      protocol,
    });

    return NextResponse.json({
      success: true,
      authorization_url: paymentResult.authorization_url,
      access_code: paymentResult.access_code,
      reference: paymentResult.reference,
    });
  } catch (error) {
    console.error('Error initializing Flutterwave transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to initialize payment.' },
      { status: 400 }
    );
  }
}