import {
  setCostAnnotation,
  getCostAnnotation,
  applyCostAnnotations,
  clearCostRegistry,
  getCostSummary,
  routeKey,
} from './routeCostAnnotator';
import { RouteInfo } from './types';

const baseRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
});

beforeEach(() => clearCostRegistry());

describe('routeKey', () => {
  it('normalizes method to uppercase', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setCostAnnotation / getCostAnnotation', () => {
  it('stores and retrieves a cost annotation', () => {
    setCostAnnotation('GET', '/heavy', { tier: 'high', estimatedMs: 500, notes: 'DB heavy' });
    const result = getCostAnnotation('GET', '/heavy');
    expect(result).toEqual({ tier: 'high', estimatedMs: 500, notes: 'DB heavy' });
  });

  it('returns undefined for unannotated routes', () => {
    expect(getCostAnnotation('POST', '/unknown')).toBeUndefined();
  });
});

describe('applyCostAnnotations', () => {
  it('attaches cost to matching routes', () => {
    setCostAnnotation('GET', '/reports', { tier: 'critical' });
    const routes = [baseRoute('GET', '/reports'), baseRoute('GET', '/health')];
    const result = applyCostAnnotations(routes);
    expect((result[0] as any).cost).toEqual({ tier: 'critical' });
    expect((result[1] as any).cost).toBeUndefined();
  });

  it('does not mutate original routes', () => {
    setCostAnnotation('DELETE', '/data', { tier: 'medium' });
    const route = baseRoute('DELETE', '/data');
    applyCostAnnotations([route]);
    expect((route as any).cost).toBeUndefined();
  });
});

describe('getCostSummary', () => {
  it('counts routes per tier', () => {
    setCostAnnotation('GET', '/a', { tier: 'free' });
    setCostAnnotation('GET', '/b', { tier: 'high' });
    setCostAnnotation('POST', '/c', { tier: 'high' });
    const summary = getCostSummary();
    expect(summary.free).toBe(1);
    expect(summary.high).toBe(2);
    expect(summary.low).toBe(0);
  });
});

describe('clearCostRegistry', () => {
  it('removes all annotations', () => {
    setCostAnnotation('GET', '/x', { tier: 'low' });
    clearCostRegistry();
    expect(getCostAnnotation('GET', '/x')).toBeUndefined();
  });
});
