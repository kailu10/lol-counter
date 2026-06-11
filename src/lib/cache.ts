import type { CounterResult } from '@/types';

const TTL_MS = 4 * 60 * 60 * 1000; // 4時間

const store = new Map<string, CounterResult>();

export function cacheKey(championId: string, role: string): string {
  return `${championId.toLowerCase()}:${role}`;
}

export function getCached(key: string): CounterResult | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function setCached(key: string, result: CounterResult): void {
  store.set(key, result);
}
