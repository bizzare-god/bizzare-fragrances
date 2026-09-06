import crypto from 'crypto';

function getPaystackSecretKey(): string {
  return (process.env.PAYSTACK_SECRET_KEY || '').trim();
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer?: {
      email: string;
      customer_code?: string;
    };
    paid_at?: string;
    channel?: string;
  };
}

/**
 * Initialize a transaction with Paystack API.
 * In production, fails closed if PAYSTACK_SECRET_KEY is not configured.
 * In development, if secret key is present, calls real Paystack endpoint; falls back to sandbox only when key is empty.
 */
export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in NGN (will convert to kobo for Paystack)
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const secretKey = getPaystackSecretKey();
  const amountInKobo = Math.round(params.amount * 100);

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('PAYSTACK_SECRET_KEY is missing in production environment.');
      return {
        status: false,
        message: 'Payment gateway configuration error. Please contact support.',
      };
    }

    // Sandbox / Mock fallback ONLY when secret key is completely missing in dev
    console.info(`[SANDBOX TEST MODE] Initializing mock Paystack transaction: ${params.reference}`);
    const baseUrl = params.callbackUrl ? params.callbackUrl.split('?')[0] : '/account';
    return {
      status: true,
      message: 'Sandbox transaction initialized (Paystack secret key not configured in dev).',
      data: {
        authorization_url: `${baseUrl}?reference=${encodeURIComponent(params.reference)}&mock_payment=true`,
        access_code: `mock_code_${params.reference}`,
        reference: params.reference,
      },
    };
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountInKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const data = await response.json();
    return data as PaystackInitResponse;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unable to connect to Paystack.',
    };
  }
}

/**
 * Verify a transaction with Paystack API.
 * In production, fails closed if PAYSTACK_SECRET_KEY is not configured.
 */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('PAYSTACK_SECRET_KEY is missing in production environment during verification.');
      return {
        status: false,
        message: 'Payment gateway configuration error.',
      };
    }

    // Sandbox / Mock verification in development
    console.info(`[SANDBOX TEST MODE] Verifying mock Paystack transaction: ${reference}`);
    return {
      status: true,
      message: 'Sandbox payment verified.',
      data: {
        id: Math.floor(Math.random() * 1000000),
        status: 'success',
        reference,
        amount: 0,
        currency: 'NGN',
        paid_at: new Date().toISOString(),
        channel: 'card',
      },
    };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data as PaystackVerifyResponse;
  } catch (error) {
    console.error('Paystack verification error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unable to verify payment with Paystack.',
    };
  }
}

/**
 * Verify Paystack webhook signature using HMAC SHA-512.
 * Fails closed (returns false) if PAYSTACK_SECRET_KEY is missing.
 */
export function verifyPaystackWebhookSignature(payload: string, signature: string): boolean {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    console.warn('Rejecting webhook: PAYSTACK_SECRET_KEY is not set.');
    return false;
  }
  const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
  return hash === signature;
}
