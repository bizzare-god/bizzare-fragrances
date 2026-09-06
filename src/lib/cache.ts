type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<any>>();

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttlMs: number = 30_000): void {
    store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  delete(key: string): void {
    store.delete(key);
  },

  clearPattern(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    }
  },
};

export function invalidateProductCache(): void {
  memoryCache.clearPattern('public_products_');
}
