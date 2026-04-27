import {
  setQueryParams,
  getQueryParams,
  applyQueryAnnotations,
  clearQueryRegistry,
  getQuerySummary,
  QueryParam,
} from './routeQueryAnnotator';
import { RouteInfo } from './types';

const sampleParams: QueryParam[] = [
  { name: 'page', type: 'number', required: false, defaultValue: '1', description: 'Page number' },
  { name: 'limit', type: 'number', required: false, defaultValue: '20', description: 'Items per page' },
];

const baseRoute: RouteInfo = { method: 'GET', path: '/users', middleware: [] };

beforeEach(() => {
  clearQueryRegistry();
});

describe('setQueryParams / getQueryParams', () => {
  it('stores and retrieves query params by method and path', () => {
    setQueryParams('GET', '/users', sampleParams);
    expect(getQueryParams('GET', '/users')).toEqual(sampleParams);
  });

  it('returns undefined for unregistered route', () => {
    expect(getQueryParams('POST', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    setQueryParams('get', '/items', sampleParams);
    expect(getQueryParams('GET', '/items')).toEqual(sampleParams);
  });
});

describe('applyQueryAnnotations', () => {
  it('annotates matching routes with query params', () => {
    setQueryParams('GET', '/users', sampleParams);
    const result = applyQueryAnnotations([baseRoute]);
    expect(result[0].meta?.queryParams).toEqual(sampleParams);
  });

  it('leaves routes without registered params unchanged', () => {
    const result = applyQueryAnnotations([baseRoute]);
    expect(result[0].meta?.queryParams).toBeUndefined();
  });

  it('merges with existing meta fields', () => {
    setQueryParams('GET', '/users', sampleParams);
    const routeWithMeta: RouteInfo = { ...baseRoute, meta: { deprecated: true } };
    const result = applyQueryAnnotations([routeWithMeta]);
    expect(result[0].meta?.deprecated).toBe(true);
    expect(result[0].meta?.queryParams).toEqual(sampleParams);
  });
});

describe('getQuerySummary', () => {
  it('returns all registered query param entries', () => {
    setQueryParams('GET', '/users', sampleParams);
    setQueryParams('GET', '/posts', [{ name: 'search', type: 'string', required: false }]);
    const summary = getQuerySummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary['GET:/users']).toEqual(sampleParams);
  });

  it('returns empty object when registry is clear', () => {
    expect(getQuerySummary()).toEqual({});
  });
});
