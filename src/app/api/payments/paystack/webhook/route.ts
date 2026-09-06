import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { markOrderPaid } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      console.warn('Unauthorized or invalid Paystack webhook signature received.');
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === 'charge.success' && data?.reference) {
      const reference = data.reference;

      try {
        await markOrderPaid(reference, {
          reference,
          amountKobo: data.amount,
          channel: data.channel,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
          actionSource: 'WEBHOOK_PAYMENT_SUCCESS',
        });
      } catch (markError) {
        console.error('Error marking order paid in webhook:', markError);
        // Still acknowledge webhook receipt to Paystack
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
