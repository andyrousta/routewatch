import { filterRoutes, groupRoutesByPrefix, deduplicateRoutes } from './routeFilter';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', tags: ['users'] },
  { method: 'POST', path: '/users', tags: ['users'] },
  { method: 'GET', path: '/users/:id', tags: ['users'] },
  { method: 'DELETE', path: '/users/:id', tags: ['users', 'admin'] },
  { method: 'GET', path: '/posts', tags: ['posts'] },
  { method: 'GET', path: '/health', tags: ['system'] },
];

describe('filterRoutes', () => {
  it('filters by method', () => {
    const result = filterRoutes(sampleRoutes, { methods: ['GET'] });
    expect(result).toHaveLength(4);
    expect(result.every((r) => r.method === 'GET')).toBe(true);
  });

  it('filters by pathPrefix', () => {
    const result = filterRoutes(sampleRoutes, { pathPrefix: '/users' });
    expect(result).toHaveLength(4);
  });

  it('excludes paths', () => {
    const result = filterRoutes(sampleRoutes, { excludePaths: ['/health'] });
    expect(result).toHaveLength(5);
    expect(result.find((r) => r.path === '/health')).toBeUndefined();
  });

  it('filters by tags', () => {
    const result = filterRoutes(sampleRoutes, { tags: ['admin'] });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/users/:id');
  });

  it('returns all routes when no options provided', () => {
    const result = filterRoutes(sampleRoutes, {});
    expect(result).toHaveLength(sampleRoutes.length);
  });
});

describe('groupRoutesByPrefix', () => {
  it('groups routes by first path segment', () => {
    const groups = groupRoutesByPrefix(sampleRoutes);
    expect(Object.keys(groups)).toEqual(expect.arrayContaining(['users', 'posts', 'health']));
    expect(groups['users']).toHaveLength(4);
    expect(groups['posts']).toHaveLength(1);
  });
});

describe('deduplicateRoutes', () => {
  it('removes duplicate method+path combinations', () => {
    const withDupes: RouteInfo[] = [
      ...sampleRoutes,
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ];
    const result = deduplicateRoutes(withDupes);
    expect(result).toHaveLength(sampleRoutes.length);
  });

  it('keeps routes with same path but different methods', () => {
    const result = deduplicateRoutes(sampleRoutes);
    expect(result).toHaveLength(sampleRoutes.length);
  });
});
