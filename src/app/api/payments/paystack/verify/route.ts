import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { orderDto } from '@/lib/serializers';
import { markOrderPaid } from '@/lib/orders';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Sign in is required to verify payment.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reference = typeof body.reference === 'string' ? body.reference.trim() : '';

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
    }

    // Verify transaction with Paystack
    const paystackResult = await verifyPaystackTransaction(reference);
    if (!paystackResult.status || paystackResult.data?.status !== 'success') {
      return NextResponse.json(
        { error: paystackResult.message || 'Payment verification failed with Paystack.' },
        { status: 400 }
      );
    }

    // Atomically mark order paid and update inventory safely
    const result = await markOrderPaid(reference, {
      reference,
      amountKobo: paystackResult.data.amount,
      channel: paystackResult.data.channel,
      paidAt: paystackResult.data.paid_at ? new Date(paystackResult.data.paid_at) : new Date(),
      actorId: user.id,
      actorName: user.name,
      actionSource: 'PAYMENT_VERIFIED',
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyPaid
        ? 'Order was already verified and marked paid.'
        : 'Payment verified successfully. Order is now queued for boutique preparation.',
      order: orderDto(result.order),
    });
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify payment.' },
      { status: 500 }
    );
  }
}
