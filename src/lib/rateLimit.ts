type RateLimitEntry = { count: number; resetAt: number };

const attempts = new Map<string, RateLimitEntry>();
let lastPrune = Date.now();
const PRUNE_INTERVAL_MS = 5 * 60 * 1000; // Prune every 5 minutes

function pruneExpiredEntries() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;

  for (const [key, entry] of attempts.entries()) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  pruneExpiredEntries();

  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    console.warn(`[SECURITY] Rate limit exceeded for key: ${key}. Retry after: ${retryAfter}s`);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

export function requestIdentifier(request: Request, identifier?: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || request.headers.get('x-real-ip') || 'unknown';
  const cleanId = identifier?.trim().toLowerCase() || 'anonymous';
  return `${ip}:${cleanId}`;
}
