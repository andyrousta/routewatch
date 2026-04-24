import {
  setCachedRoutes,
  getCachedRoutes,
  isCacheStale,
  hasCacheChanged,
  invalidateCache,
  clearAllCaches,
  getCacheKeys,
} from './routeCache';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', description: 'List users' },
  { method: 'POST', path: '/users', description: 'Create user' },
];

beforeEach(() => {
  clearAllCaches();
});

describe('routeCache', () => {
  it('should store and retrieve cached routes', () => {
    setCachedRoutes('app', sampleRoutes);
    const result = getCachedRoutes('app');
    expect(result).toEqual(sampleRoutes);
  });

  it('should return null for missing cache key', () => {
    expect(getCachedRoutes('nonexistent')).toBeNull();
  });

  it('should return a copy of cached routes, not the original reference', () => {
    setCachedRoutes('app', sampleRoutes);
    const result = getCachedRoutes('app');
    expect(result).not.toBe(sampleRoutes);
  });

  it('should report cache as stale when maxAge exceeded', () => {
    setCachedRoutes('app', sampleRoutes);
    expect(isCacheStale('app', 0)).toBe(true);
  });

  it('should report cache as not stale within maxAge', () => {
    setCachedRoutes('app', sampleRoutes);
    expect(isCacheStale('app', 60000)).toBe(false);
  });

  it('should report stale for missing key regardless of maxAge', () => {
    expect(isCacheStale('missing', 99999)).toBe(true);
  });

  it('should detect no change when routes are identical', () => {
    setCachedRoutes('app', sampleRoutes);
    expect(hasCacheChanged('app', [...sampleRoutes])).toBe(false);
  });

  it('should detect change when routes differ', () => {
    setCachedRoutes('app', sampleRoutes);
    const updated = [...sampleRoutes, { method: 'DELETE', path: '/users/:id' }];
    expect(hasCacheChanged('app', updated)).toBe(true);
  });

  it('should invalidate a specific cache key', () => {
    setCachedRoutes('app', sampleRoutes);
    invalidateCache('app');
    expect(getCachedRoutes('app')).toBeNull();
  });

  it('should list all cache keys', () => {
    setCachedRoutes('app1', sampleRoutes);
    setCachedRoutes('app2', sampleRoutes);
    expect(getCacheKeys()).toEqual(expect.arrayContaining(['app1', 'app2']));
  });
});
