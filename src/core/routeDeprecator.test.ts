import {
  setDeprecationMap,
  getDeprecationMap,
  markDeprecated,
  isDeprecated,
  applyDeprecations,
  getDeprecatedRoutes,
  clearDeprecations,
} from './routeDeprecator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middlewares: [] },
  { method: 'POST', path: '/users', middlewares: [] },
  { method: 'DELETE', path: '/users/:id', middlewares: [] },
];

beforeEach(() => {
  clearDeprecations();
});

describe('markDeprecated / isDeprecated', () => {
  it('marks a route as deprecated', () => {
    markDeprecated('GET', '/users', { deprecatedSince: '1.2.0' });
    expect(isDeprecated('GET', '/users')).toBe(true);
  });

  it('returns false for non-deprecated routes', () => {
    expect(isDeprecated('POST', '/users')).toBe(false);
  });

  it('is case-insensitive for method', () => {
    markDeprecated('get', '/users', {});
    expect(isDeprecated('GET', '/users')).toBe(true);
  });
});

describe('setDeprecationMap / getDeprecationMap', () => {
  it('sets and retrieves the full map', () => {
    const map = { 'DELETE:/users/:id': { deprecated: true, removalDate: '2025-01-01' } };
    setDeprecationMap(map);
    expect(getDeprecationMap()).toEqual(map);
  });
});

describe('applyDeprecations', () => {
  it('annotates deprecated routes with meta', () => {
    markDeprecated('DELETE', '/users/:id', { deprecatedSince: '2.0.0', replacedBy: '/v2/users/:id' });
    const result = applyDeprecations(sampleRoutes);
    const deleted = result.find((r) => r.method === 'DELETE');
    expect(deleted?.deprecated).toBe(true);
    expect(deleted?.replacedBy).toBe('/v2/users/:id');
  });

  it('marks non-deprecated routes with deprecated: false', () => {
    const result = applyDeprecations(sampleRoutes);
    result.forEach((r) => expect(r.deprecated).toBe(false));
  });
});

describe('getDeprecatedRoutes', () => {
  it('returns only deprecated routes', () => {
    markDeprecated('GET', '/users', {});
    const deprecated = getDeprecatedRoutes(sampleRoutes);
    expect(deprecated).toHaveLength(1);
    expect(deprecated[0].path).toBe('/users');
  });

  it('returns empty array when none deprecated', () => {
    expect(getDeprecatedRoutes(sampleRoutes)).toHaveLength(0);
  });
});
