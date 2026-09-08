import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ user: null });

    let shipping: {
      shippingState: string | null;
      shippingCity: string | null;
      shippingStreet: string | null;
      shippingLandmark: string | null;
      shippingPhone: string | null;
    } | null = null;

    try {
      shipping = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          shippingState: true,
          shippingCity: true,
          shippingStreet: true,
          shippingLandmark: true,
          shippingPhone: true,
        },
      });
    } catch (e) {
      console.error('Failed to load saved shipping address:', e);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        phone: user.phone || null,
        role: user.role.toLowerCase(),
        shipping_state: shipping?.shippingState || null,
        shipping_city: shipping?.shippingCity || null,
        shipping_street: shipping?.shippingStreet || null,
        shipping_landmark: shipping?.shippingLandmark || null,
        shipping_phone: shipping?.shippingPhone || null,
        created_at: user.createdAt
          ? (typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString())
          : new Date().toISOString(),
        updated_at: user.updatedAt
          ? (typeof user.updatedAt === 'string' ? user.updatedAt : user.updatedAt.toISOString())
          : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ user: null });
  }
}
