import {
  findDuplicateRoutes,
  findInvalidPaths,
  findMissingMethods,
  runHealthCheck,
} from './routeHealthCheck';
import { RouteInfo } from './types';

const makeRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
  middlewares: [],
});

describe('findDuplicateRoutes', () => {
  it('returns empty array when no duplicates', () => {
    const routes = [makeRoute('GET', '/users'), makeRoute('POST', '/users')];
    expect(findDuplicateRoutes(routes)).toEqual([]);
  });

  it('detects duplicate method+path combinations', () => {
    const routes = [makeRoute('GET', '/users'), makeRoute('GET', '/users')];
    expect(findDuplicateRoutes(routes)).toEqual(['GET:/users']);
  });
});

describe('findMissingMethods', () => {
  it('returns empty array for valid methods', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('DELETE', '/b')];
    expect(findMissingMethods(routes)).toEqual([]);
  });

  it('flags unknown HTTP methods', () => {
    const routes = [makeRoute('FETCH', '/a'), makeRoute('GET', '/b')];
    expect(findMissingMethods(routes)).toEqual(['FETCH:/a']);
  });
});

describe('findInvalidPaths', () => {
  it('returns empty array for valid paths', () => {
    const routes = [makeRoute('GET', '/'), makeRoute('GET', '/users/:id')];
    expect(findInvalidPaths(routes)).toEqual([]);
  });

  it('flags paths with invalid characters', () => {
    const routes = [makeRoute('GET', 'no-leading-slash')];
    expect(findInvalidPaths(routes)).toContain('no-leading-slash');
  });
});

describe('runHealthCheck', () => {
  it('returns healthy for clean routes', () => {
    const routes = [makeRoute('GET', '/users'), makeRoute('POST', '/users')];
    const result = runHealthCheck(routes);
    expect(result.status).toBe('healthy');
    expect(result.totalRoutes).toBe(2);
  });

  it('returns warnings for duplicate routes', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('GET', '/a')];
    const result = runHealthCheck(routes);
    expect(result.status).toBe('warnings');
    expect(result.duplicates).toHaveLength(1);
  });

  it('returns errors for invalid methods', () => {
    const routes = [makeRoute('INVALID', '/a')];
    const result = runHealthCheck(routes);
    expect(result.status).toBe('errors');
  });

  it('includes summary string', () => {
    const routes = [makeRoute('GET', '/users')];
    const result = runHealthCheck(routes);
    expect(result.summary).toContain('1 route(s) checked');
  });
});
