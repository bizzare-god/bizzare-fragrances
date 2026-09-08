import { NextRequest, NextResponse } from 'next/server';
import { verifyFlutterwaveWebhookSignature, verifyFlutterwaveTransaction } from '@/lib/flutterwave';
import { markOrderPaid } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const verifHash = request.headers.get('verif-hash');
    const flutterwaveSignature = request.headers.get('flutterwave-signature');

    if (!verifyFlutterwaveWebhookSignature(rawBody, { verifHash, flutterwaveSignature })) {
      console.warn('Unauthorized or invalid Flutterwave webhook signature received.');
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === 'charge.completed' && data?.status === 'successful' && data?.tx_ref) {
      const txRef = String(data.tx_ref);
      const transactionId = data.id || data.transaction_id;

      try {
        // Per Flutterwave guidance, re-verify the transaction before giving value.
        if (transactionId) {
          const verified = await verifyFlutterwaveTransaction(transactionId);
          if (verified.status !== 'success' || verified.data?.status !== 'successful') {
            console.warn(`Flutterwave webhook re-verification failed for ${txRef}; skipping mark-paid.`);
            return NextResponse.json({ received: true, verified: false });
          }
        }

        await markOrderPaid(txRef, {
          reference: txRef,
          amountPaid: Number(data.amount),
          amountUnit: 'naira',
          channel: data.payment_type,
          paidAt: data.created_at ? new Date(data.created_at) : new Date(),
          actionSource: 'FLUTTERWAVE_WEBHOOK_CHARGE_COMPLETED',
        });
      } catch (markError) {
        console.error('Error marking order paid in Flutterwave webhook:', markError);
        // Still acknowledge webhook receipt to Flutterwave
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Flutterwave webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}