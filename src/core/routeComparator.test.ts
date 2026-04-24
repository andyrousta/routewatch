import {
  routeKey,
  compareRoutes,
  hasRouteChanges,
  formatDiffSummary,
} from './routeComparator';
import { RouteInfo } from './types';

const makeRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
  middleware: [],
});

describe('routeKey', () => {
  it('should produce an uppercase method:path key', () => {
    expect(routeKey(makeRoute('get', '/users'))).toBe('GET:/users');
    expect(routeKey(makeRoute('POST', '/items'))).toBe('POST:/items');
  });
});

describe('compareRoutes', () => {
  const prev = [makeRoute('GET', '/users'), makeRoute('DELETE', '/users/:id')];
  const curr = [
    makeRoute('GET', '/users'),
    makeRoute('POST', '/users'),
  ];

  it('should detect added routes', () => {
    const diff = compareRoutes(prev, curr);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].path).toBe('/users');
    expect(diff.added[0].method).toBe('POST');
  });

  it('should detect removed routes', () => {
    const diff = compareRoutes(prev, curr);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].path).toBe('/users/:id');
  });

  it('should detect unchanged routes', () => {
    const diff = compareRoutes(prev, curr);
    expect(diff.unchanged).toHaveLength(1);
    expect(diff.unchanged[0].path).toBe('/users');
    expect(diff.unchanged[0].method).toBe('GET');
  });

  it('should return empty arrays when routes are identical', () => {
    const diff = compareRoutes(prev, prev);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.unchanged).toHaveLength(2);
  });
});

describe('hasRouteChanges', () => {
  it('should return true when routes differ', () => {
    const prev = [makeRoute('GET', '/a')];
    const curr = [makeRoute('GET', '/b')];
    expect(hasRouteChanges(prev, curr)).toBe(true);
  });

  it('should return false when routes are the same', () => {
    const routes = [makeRoute('GET', '/a')];
    expect(hasRouteChanges(routes, routes)).toBe(false);
  });
});

describe('formatDiffSummary', () => {
  it('should return no-change message when diff is empty', () => {
    const summary = formatDiffSummary({ added: [], removed: [], unchanged: [] });
    expect(summary).toBe('No route changes detected.');
  });

  it('should include added and removed routes in summary', () => {
    const diff = {
      added: [makeRoute('POST', '/users')],
      removed: [makeRoute('DELETE', '/users/:id')],
      unchanged: [],
    };
    const summary = formatDiffSummary(diff);
    expect(summary).toContain('+ POST /users');
    expect(summary).toContain('- DELETE /users/:id');
  });
});
