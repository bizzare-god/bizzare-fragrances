import { DiscountType } from '@prisma/client';

export type StorewideSaleInput = {
  discountPercent?: number | null;
  discountEndsAt?: Date | null;
};

export type DiscountablePriceInput = {
  price: { toString(): string } | number;
  discountType?: string | null;
  discountPercent?: number | null;
  discountPrice?: { toString(): string } | number | null;
  discountEndsAt?: Date | null;
};

export type EffectivePrice = {
  original: number;
  current: number;
  percent: number | null;
  saleEndsAt: string | null;
  saleActive: boolean;
};

function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeEffectivePrice(
  product: DiscountablePriceInput,
  storewide?: StorewideSaleInput | null
): EffectivePrice {
  const original = round2(toNumber(product.price));
  const now = Date.now();

  const ownEndsAt = product.discountEndsAt ? new Date(product.discountEndsAt) : null;
  const ownActive = ownEndsAt ? now < ownEndsAt.getTime() : false;

  if (product.discountType === DiscountType.PERCENT && ownActive) {
    const pct = Number(product.discountPercent) || 0;
    if (pct >= 1 && pct <= 99) {
      return {
        original,
        current: round2(original * (1 - pct / 100)),
        percent: pct,
        saleEndsAt: ownEndsAt!.toISOString(),
        saleActive: true,
      };
    }
  }

  if (product.discountType === DiscountType.FIXED && ownActive) {
    const fixed = round2(toNumber(product.discountPrice));
    if (fixed > 0 && fixed < original) {
      return {
        original,
        current: fixed,
        percent: Math.round(((original - fixed) / original) * 100),
        saleEndsAt: ownEndsAt!.toISOString(),
        saleActive: true,
      };
    }
  }

  const storeEndsAt = storewide?.discountEndsAt ? new Date(storewide.discountEndsAt) : null;
  const storeActive = storeEndsAt ? now < storeEndsAt.getTime() : false;
  const storePct = Number(storewide?.discountPercent) || 0;

  if (storeActive && storePct >= 1 && storePct <= 99) {
    return {
      original,
      current: round2(original * (1 - storePct / 100)),
      percent: storePct,
      saleEndsAt: storeEndsAt!.toISOString(),
      saleActive: true,
    };
  }

  return { original, current: original, percent: null, saleEndsAt: null, saleActive: false };
}

export type ParsedDiscount = {
  discountType: DiscountType | null;
  discountPercent: number | null;
  discountPrice: number | null;
  discountEndsAt: Date | null;
};

/**
 * Validate and normalize discount fields from an admin request body.
 * Throws an Error with a human-readable message when invalid.
 * An explicit `discount_type` of a non-discount value (or the absence of one)
 * clears any existing discount.
 */
export function parseDiscountFields(body: Record<string, unknown>, basePrice: number): ParsedDiscount {
  const type = body.discount_type;
  const supported = type === 'PERCENT' || type === 'FIXED';

  if (!supported) {
    return { discountType: null, discountPercent: null, discountPrice: null, discountEndsAt: null };
  }

  const endsRaw = typeof body.discount_ends_at === 'string' && body.discount_ends_at.trim() ? body.discount_ends_at.trim() : null;
  const endsAt = endsRaw ? new Date(endsRaw) : null;

  if (!endsAt || Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= Date.now()) {
    throw new Error('A limited-time discount requires a valid end date and time in the future.');
  }

  if (type === 'PERCENT') {
    const pct = Number(body.discount_percent);
    if (!Number.isInteger(pct) || pct < 1 || pct > 99) {
      throw new Error('Discount percentage must be a whole number between 1 and 99.');
    }
    return { discountType: DiscountType.PERCENT, discountPercent: pct, discountPrice: null, discountEndsAt: endsAt };
  }

  const fixed = Number(body.discount_price);
  if (!Number.isFinite(fixed) || fixed <= 0 || fixed >= basePrice) {
    throw new Error('Sale price must be greater than zero and lower than the regular price.');
  }
  return { discountType: DiscountType.FIXED, discountPercent: null, discountPrice: fixed, discountEndsAt: endsAt };
}