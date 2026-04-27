import {
  setRateLimit,
  getRateLimit,
  applyRateLimitAnnotations,
  clearRateLimitRegistry,
  getRateLimitSummary,
} from './routeRateLimitAnnotator';
import { RouteInfo } from './types';

const baseRoute: RouteInfo = {
  method: 'GET',
  path: '/api/users',
};

beforeEach(() => {
  clearRateLimitRegistry();
});

describe('setRateLimit / getRateLimit', () => {
  it('stores and retrieves a rate limit config by method and path', () => {
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 100 });
    const config = getRateLimit('GET', '/api/users');
    expect(config).toEqual({ windowMs: 60000, maxRequests: 100 });
  });

  it('returns undefined for unregistered routes', () => {
    expect(getRateLimit('POST', '/api/unknown')).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    setRateLimit('get', '/api/items', { windowMs: 1000, maxRequests: 10 });
    expect(getRateLimit('GET', '/api/items')).toBeDefined();
  });

  it('overwrites an existing rate limit config for the same route', () => {
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 100 });
    setRateLimit('GET', '/api/users', { windowMs: 30000, maxRequests: 50 });
    const config = getRateLimit('GET', '/api/users');
    expect(config).toEqual({ windowMs: 30000, maxRequests: 50 });
  });
});

describe('applyRateLimitAnnotations', () => {
  it('annotates a matching route with rate limit metadata', () => {
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 50, label: '50/min' });
    const result = applyRateLimitAnnotations([baseRoute]);
    expect(result[0].metadata?.rateLimit).toEqual({
      windowMs: 60000,
      maxRequests: 50,
      label: '50/min',
    });
  });

  it('generates a default label when none is provided', () => {
    setRateLimit('GET', '/api/users', { windowMs: 30000, maxRequests: 20 });
    const result = applyRateLimitAnnotations([baseRoute]);
    expect(result[0].metadata?.rateLimit.label).toBe('20 req / 30000ms');
  });

  it('leaves routes without a registered rate limit unchanged', () => {
    const result = applyRateLimitAnnotations([baseRoute]);
    expect(result[0].metadata?.rateLimit).toBeUndefined();
  });

  it('preserves existing metadata on the route', () => {
    const routeWithMeta: RouteInfo = { ...baseRoute, metadata: { deprecated: true } };
    setRateLimit('GET', '/api/users', { windowMs: 1000, maxRequests: 5 });
    const result = applyRateLimitAnnotations([routeWithMeta]);
    expect(result[0].metadata?.deprecated).toBe(true);
    expect(result[0].metadata?.rateLimit).toBeDefined();
  });

  it('annotates multiple routes independently', () => {
    const secondRoute: RouteInfo = { method: 'POST', path: '/api/orders' };
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 100 });
    setRateLimit('POST', '/api/orders', { windowMs: 5000, maxRequests: 10 });
    const result = applyRateLimitAnnotations([baseRoute, secondRoute]);
    expect(result[0].metadata?.rateLimit?.maxRequests).toBe(100);
    expect(result[1].metadata?.rateLimit?.maxRequests).toBe(10);
  });
});

describe('getRateLimitSummary', () => {
  it('returns all registered rate limits as a plain object', () => {
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 100 });
    setRateLimit('POST', '/api/orders', { windowMs: 5000, maxRequests: 10 });
    const summary = getRateLimitSummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary['GET:/api/users']).toBeDefined();
    expect(summary['POST:/api/orders']).toBeDefined();
  });

  it('returns an empty object when no rate limits are registered', () => {
    const summary = getRateLimitSummary();
    expect(summary).toEqual({});
  });
});
