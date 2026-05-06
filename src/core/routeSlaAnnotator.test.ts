import {
  setSlaAnnotation,
  getSlaAnnotation,
  applySlaAnnotations,
  clearSlaRegistry,
  getSlaSummary,
  routeKey,
} from './routeSlaAnnotator';
import { RouteInfo } from './types';

const baseRoute: RouteInfo = { method: 'GET', path: '/api/users' };

beforeEach(() => {
  clearSlaRegistry();
});

describe('routeKey', () => {
  it('should produce an uppercase method key', () => {
    expect(routeKey('get', '/api/users')).toBe('GET:/api/users');
  });
});

describe('setSlaAnnotation / getSlaAnnotation', () => {
  it('should store and retrieve an SLA annotation', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200, priority: 'high' });
    expect(getSlaAnnotation('GET', '/api/users')).toEqual({
      maxResponseTimeMs: 200,
      priority: 'high',
    });
  });

  it('should return undefined for unknown route', () => {
    expect(getSlaAnnotation('POST', '/api/unknown')).toBeUndefined();
  });
});

describe('applySlaAnnotations', () => {
  it('should attach sla to matching routes', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 150, sloPercentage: 99.9 });
    const result = applySlaAnnotations([baseRoute]);
    expect(result[0].meta?.sla).toEqual({ maxResponseTimeMs: 150, sloPercentage: 99.9 });
  });

  it('should not modify routes without an SLA annotation', () => {
    const result = applySlaAnnotations([baseRoute]);
    expect(result[0].meta?.sla).toBeUndefined();
  });

  it('should merge with existing meta', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 300, priority: 'critical' });
    const routeWithMeta: RouteInfo = { ...baseRoute, meta: { owner: 'team-a' } };
    const result = applySlaAnnotations([routeWithMeta]);
    expect(result[0].meta?.owner).toBe('team-a');
    expect(result[0].meta?.sla?.priority).toBe('critical');
  });
});

describe('getSlaSummary', () => {
  it('should return all registered SLA entries', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 100 });
    setSlaAnnotation('POST', '/api/orders', { maxResponseTimeMs: 500, priority: 'low' });
    const summary = getSlaSummary();
    expect(summary).toHaveLength(2);
    expect(summary.map((s) => s.key)).toContain('GET:/api/users');
  });
});

describe('clearSlaRegistry', () => {
  it('should remove all entries', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200 });
    clearSlaRegistry();
    expect(getSlaSummary()).toHaveLength(0);
  });
});
