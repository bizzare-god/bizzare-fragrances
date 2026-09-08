import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { orderDto } from '@/lib/serializers';
import { initializeOrderPayment, orderInclude } from '@/lib/orders';
import { sendAdminOrderNotificationEmail } from '@/lib/email';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

type CheckoutItem = { product_id: string; quantity: number };

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 });

    const where = user.role === UserRole.ADMIN ? {} : { buyerId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders: orders.map(orderDto) });
  } catch {
    return NextResponse.json({ error: 'Unable to load orders.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in is required before checkout.' }, { status: 401 });

    const limit = rateLimit(`checkout:${requestIdentifier(request, user.id)}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please wait a few minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const items = (Array.isArray(body.items) ? body.items : []) as CheckoutItem[];
    const state = typeof body.state === 'string' ? body.state.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const street = typeof body.street_address === 'string' ? body.street_address.trim() : '';
    const landmark = typeof body.landmark === 'string' ? body.landmark.trim() : '';
    const legacyAddress = typeof body.shipping_address === 'string' ? body.shipping_address.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;

    // Prefer structured fields; fall back to the previously-supported single string
    const address =
      street && city && state
        ? `${street}${landmark ? `, ${landmark}` : ''}, ${city}, ${state} State, Nigeria`
        : legacyAddress;

    if (
      !address ||
      !phone ||
      !items.length ||
      items.some((item) => typeof item.product_id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1)
    ) {
      return NextResponse.json({ error: 'Provide delivery details and valid order items.' }, { status: 400 });
    }

    const productIds = [...new Set(items.map((item) => item.product_id))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more fragrances are unavailable.' }, { status: 409 });
    }

    const byId = new Map(products.map((product) => [product.id, product]));
    if (items.some((item) => !byId.get(item.product_id) || byId.get(item.product_id)!.stock < item.quantity)) {
      return NextResponse.json({ error: 'One or more fragrances no longer have sufficient stock.' }, { status: 409 });
    }

    const total = items.reduce((sum, item) => sum + Number(byId.get(item.product_id)!.price) * item.quantity, 0);
    const tempRef = `bf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        totalAmount: total,
        paymentStatus: PaymentStatus.PENDING,
        paymentReference: tempRef,
        status: OrderStatus.PENDING,
        shippingAddress: address,
        phone,
        notes,
        items: {
          create: items.map((item) => {
            const product = byId.get(item.product_id)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              priceAtPurchase: product.price,
            };
          }),
        },
      },
      include: orderInclude,
    });

    // Remember the delivery details so the client doesn't re-enter them next time
    if (street || state || city || landmark || phone) {
      await prisma.user
        .update({
          where: { id: user.id },
          data: {
            ...(state ? { shippingState: state } : {}),
            ...(city ? { shippingCity: city } : {}),
            ...(street ? { shippingStreet: street } : {}),
            ...(landmark ? { shippingLandmark: landmark } : {}),
            ...(phone ? { shippingPhone: phone } : {}),
          },
        })
        .catch((err) => console.error('Failed to save client shipping address:', err));
    }

    // Initialize Flutterwave payment
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    try {
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

      // Notify the boutique admin about the new order (fire-and-forget, never blocks checkout)
      void sendAdminOrderNotificationEmail({
        orderId: order.id,
        buyerName: user.name || 'Client',
        buyerEmail: user.email,
        buyerPhone: order.phone,
        totalAmount: Number(order.totalAmount),
        items: order.items.map((item) => ({
          name: item.product?.name || 'Fragrance',
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
        })),
        shippingAddress: order.shippingAddress,
        notes: order.notes || undefined,
      }).catch((err) => console.error('[Admin Order Notification Email Error]:', err));

      return NextResponse.json(
        {
          order: orderDto(order),
          payment: {
            status: 'pending',
            reference: paymentResult.reference,
            authorization_url: paymentResult.authorization_url,
            access_code: paymentResult.access_code,
          },
        },
        { status: 201 }
      );
    } catch (paymentErr) {
      console.error('Failed to initialize Flutterwave transaction on checkout:', paymentErr);
      await prisma.order.delete({ where: { id: order.id } }).catch(() => null);
      return NextResponse.json(
        { error: paymentErr instanceof Error ? paymentErr.message : 'Unable to initialize payment gateway.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Unable to create the order.' }, { status: 500 });
  }
}
