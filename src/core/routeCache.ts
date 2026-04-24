import { RouteInfo } from './types';

interface CacheEntry {
  routes: RouteInfo[];
  timestamp: number;
  hash: string;
}

const cache = new Map<string, CacheEntry>();

function computeHash(routes: RouteInfo[]): string {
  const str = JSON.stringify(
    routes.map((r) => `${r.method}:${r.path}`).sort()
  );
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

export function setCachedRoutes(key: string, routes: RouteInfo[]): void {
  cache.set(key, {
    routes: [...routes],
    timestamp: Date.now(),
    hash: computeHash(routes),
  });
}

export function getCachedRoutes(key: string): RouteInfo[] | null {
  const entry = cache.get(key);
  return entry ? [...entry.routes] : null;
}

export function isCacheStale(key: string, maxAgeMs: number): boolean {
  const entry = cache.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > maxAgeMs;
}

export function hasCacheChanged(key: string, routes: RouteInfo[]): boolean {
  const entry = cache.get(key);
  if (!entry) return true;
  return entry.hash !== computeHash(routes);
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function clearAllCaches(): void {
  cache.clear();
}

export function getCacheKeys(): string[] {
  return Array.from(cache.keys());
}
