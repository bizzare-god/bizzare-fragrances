import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError, getSessionUser } from '@/lib/auth';
import { verifyFlutterwaveTransaction, verifyFlutterwaveTransactionByReference } from '@/lib/flutterwave';
import { orderDto } from '@/lib/serializers';
import { markOrderPaid } from '@/lib/orders';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Sign in is required to verify payment.' }, { status: 401 });
    }

    const limit = rateLimit(`verify-payment:${requestIdentifier(request, user.id)}`, 20, 5 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
    const transactionIdRaw = body.transaction_id;
    const transactionId =
      typeof transactionIdRaw === 'string' && transactionIdRaw.trim()
        ? transactionIdRaw.trim()
        : typeof transactionIdRaw === 'number'
          ? transactionIdRaw
          : null;

    if (!reference && transactionId === null) {
      return NextResponse.json({ error: 'Payment reference or transaction ID is required.' }, { status: 400 });
    }

    // Verify the transaction state with Flutterwave (transaction ID takes precedence)
    const flutterwaveResult = transactionId !== null
      ? await verifyFlutterwaveTransaction(transactionId)
      : await verifyFlutterwaveTransactionByReference(reference);

    if (
      flutterwaveResult.status !== 'success' ||
      !flutterwaveResult.data ||
      flutterwaveResult.data.status !== 'successful'
    ) {
      return NextResponse.json(
        { error: flutterwaveResult.message || 'Payment verification failed with Flutterwave.' },
        { status: 400 }
      );
    }

    const txRef = flutterwaveResult.data.tx_ref || reference;
    const orderRef = reference || txRef;

    // Atomically mark order paid and update inventory safely
    const result = await markOrderPaid(orderRef, {
      reference: txRef,
      amountPaid: Number(flutterwaveResult.data.amount),
      amountUnit: 'naira',
      channel: flutterwaveResult.data.payment_type,
      paidAt: flutterwaveResult.data.created_at ? new Date(flutterwaveResult.data.created_at) : new Date(),
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
    console.error('Error verifying Flutterwave payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify payment.' },
      { status: 400 }
    );
  }
}