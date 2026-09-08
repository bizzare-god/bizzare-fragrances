import crypto from 'crypto';

const FLUTTERWAVE_API_BASE = 'https://api.flutterwave.com/v3';

function getFlutterwaveSecretKey(): string {
  return (process.env.FLUTTERWAVE_SECRET_KEY || '').trim();
}

function getFlutterwaveWebhookSecretHash(): string {
  return (process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || '').trim();
}

export interface FlutterwaveInitResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    id?: number;
  };
}

export interface FlutterwaveVerifyData {
  id: number;
  tx_ref: string;
  flw_ref?: string;
  amount: number;
  charged_amount?: number;
  currency: string;
  status: string;
  payment_type?: string;
  created_at?: string;
  customer?: {
    email?: string;
    name?: string;
    phone_number?: string | null;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data?: FlutterwaveVerifyData | null;
}

async function flutterwaveFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${FLUTTERWAVE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) {
    console.error('Flutterwave returned 401 — check FLUTTERWAVE_SECRET_KEY.');
  }

  return (await response.json()) as T;
}

/**
 * Initialize a payment with Flutterwave's Standard checkout (hosted link).
 * In production, fails closed if FLUTTERWAVE_SECRET_KEY is not configured.
 * In development, falls back to a mock checkout link only when the key is empty.
 */
export async function initializeFlutterwaveTransaction(params: {
  txRef: string;
  amount: number; // in NGN (whole naira, matches our order totals)
  currency?: string;
  redirectUrl?: string;
  customer: { email: string; name?: string; phonenumber?: string };
  customizations?: { title?: string; description?: string; logo?: string };
  meta?: Record<string, unknown>;
}): Promise<FlutterwaveInitResponse> {
  const secretKey = getFlutterwaveSecretKey();

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FLUTTERWAVE_SECRET_KEY is missing in production environment.');
      return {
        status: 'error',
        message: 'Payment gateway configuration error. Please contact support.',
      };
    }

    // Sandbox / Mock fallback ONLY when secret key is completely missing in dev
    console.info(`[SANDBOX TEST MODE] Initializing mock Flutterwave transaction: ${params.txRef}`);
    const baseUrl = params.redirectUrl ? params.redirectUrl.split('?')[0] : '/account';
    return {
      status: 'success',
      message: 'Sandbox transaction initialized (Flutterwave secret key not configured in dev).',
      data: {
        link: `${baseUrl}?reference=${encodeURIComponent(params.txRef)}&transaction_id=1&status=successful&mock_payment=true`,
        id: 1,
      },
    };
  }

  try {
    return await flutterwaveFetch<FlutterwaveInitResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: params.txRef,
        amount: Math.round(params.amount),
        currency: params.currency || 'NGN',
        redirect_url: params.redirectUrl,
        customer: {
          email: params.customer.email,
          ...(params.customer.name ? { name: params.customer.name } : {}),
          ...(params.customer.phonenumber ? { phonenumber: params.customer.phonenumber } : {}),
        },
        customizations: {
          title: params.customizations?.title || 'Bizzare Fragrances',
          description: params.customizations?.description || 'Luxury fragrance acquisition',
          ...(params.customizations?.logo ? { logo: params.customizations.logo } : {}),
        },
        meta: params.meta,
      }),
    });
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unable to connect to Flutterwave.',
    };
  }
}

/**
 * Verify a transaction by Flutterwave transaction ID.
 */
export async function verifyFlutterwaveTransaction(transactionId: number | string): Promise<FlutterwaveVerifyResponse> {
  const secretKey = getFlutterwaveSecretKey();

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FLUTTERWAVE_SECRET_KEY is missing in production environment during verification.');
      return { status: 'error', message: 'Payment gateway configuration error.' };
    }

    // Sandbox / Mock verification in development
    console.info(`[SANDBOX TEST MODE] Verifying mock Flutterwave transaction: ${transactionId}`);
    return {
      status: 'success',
      message: 'Sandbox payment verified.',
      data: {
        id: Number(transactionId) || 1,
        tx_ref: '',
        amount: 0,
        currency: 'NGN',
        status: 'successful',
        payment_type: 'card',
        created_at: new Date().toISOString(),
      },
    };
  }

  try {
    return await flutterwaveFetch<FlutterwaveVerifyResponse>(
      `/transactions/${encodeURIComponent(String(transactionId))}/verify`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unable to verify payment with Flutterwave.',
    };
  }
}

/**
 * Verify a transaction using the merchant's reference (tx_ref).
 * Returns the FIRST transaction matching the reference.
 */
export async function verifyFlutterwaveTransactionByReference(txRef: string): Promise<FlutterwaveVerifyResponse> {
  const secretKey = getFlutterwaveSecretKey();

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FLUTTERWAVE_SECRET_KEY is missing in production environment during verification.');
      return { status: 'error', message: 'Payment gateway configuration error.' };
    }

    console.info(`[SANDBOX TEST MODE] Verifying mock Flutterwave transaction by reference: ${txRef}`);
    return {
      status: 'success',
      message: 'Sandbox payment verified.',
      data: {
        id: 1,
        tx_ref: txRef,
        amount: 0,
        currency: 'NGN',
        status: 'successful',
        payment_type: 'card',
        created_at: new Date().toISOString(),
      },
    };
  }

  try {
    return await flutterwaveFetch<FlutterwaveVerifyResponse>('/transactions/verify_by_reference', {
      method: 'POST',
      body: JSON.stringify({ tx_ref: txRef }),
    });
  } catch (error) {
    console.error('Flutterwave reference verification error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unable to verify payment with Flutterwave.',
    };
  }
}

/**
 * Verify a Flutterwave webhook request.
 * Two accepted signature schemes, per Flutterwave docs:
 *   1. `verif-hash` header compared directly against the configured secret hash.
 *   2. `flutterwave-signature` header: HMAC-SHA256(raw body, secret hash) hex digest.
 * Fails closed if FLUTTERWAVE_WEBHOOK_SECRET_HASH is missing.
 */
export function verifyFlutterwaveWebhookSignature(
  rawBody: string,
  headers: { verifHash?: string | null; flutterwaveSignature?: string | null }
): boolean {
  const secretHash = getFlutterwaveWebhookSecretHash();
  if (!secretHash) {
    console.warn('Rejecting webhook: FLUTTERWAVE_WEBHOOK_SECRET_HASH is not set.');
    return false;
  }

  // Scheme 1: plain verif-hash equality (constant time)
  if (headers.verifHash) {
    const expected = Buffer.from(String(secretHash));
    const received = Buffer.from(String(headers.verifHash));
    if (expected.length === received.length && crypto.timingSafeEqual(received, expected)) {
      return true;
    }
  }

  // Scheme 2: HMAC-SHA256 signature
  if (headers.flutterwaveSignature) {
    const digest = crypto.createHmac('sha256', secretHash).update(rawBody).digest('hex');
    const expected = Buffer.from(digest);
    const received = Buffer.from(String(headers.flutterwaveSignature));
    if (received.length === expected.length) {
      return crypto.timingSafeEqual(received, expected);
    }
  }

  return false;
}