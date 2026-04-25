import {
  extractVersionFromPath,
  groupRoutesByVersion,
  annotateVersions,
  getLatestVersion,
  filterByVersion,
} from './routeVersioner';
import { RouteInfo } from './types';

const mockRoutes: RouteInfo[] = [
  { method: 'GET', path: '/v1/users', middlewares: [] },
  { method: 'POST', path: '/v1/users', middlewares: [] },
  { method: 'GET', path: '/v2/users', middlewares: [] },
  { method: 'GET', path: '/v2/products', middlewares: [] },
  { method: 'DELETE', path: '/health', middlewares: [] },
];

describe('extractVersionFromPath', () => {
  it('extracts version from versioned path', () => {
    expect(extractVersionFromPath('/v1/users')).toBe('v1');
    expect(extractVersionFromPath('/v2/products/123')).toBe('v2');
  });

  it('returns null for unversioned paths', () => {
    expect(extractVersionFromPath('/health')).toBeNull();
    expect(extractVersionFromPath('/api/data')).toBeNull();
  });
});

describe('groupRoutesByVersion', () => {
  it('groups routes by version', () => {
    const grouped = groupRoutesByVersion(mockRoutes);
    expect(grouped['v1']).toHaveLength(2);
    expect(grouped['v2']).toHaveLength(2);
    expect(grouped['unversioned']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupRoutesByVersion([])).toEqual({});
  });
});

describe('annotateVersions', () => {
  it('annotates routes with their version', () => {
    const annotated = annotateVersions(mockRoutes);
    expect(annotated[0].version).toBe('v1');
    expect(annotated[2].version).toBe('v2');
    expect(annotated[4].version).toBe('unversioned');
  });
});

describe('getLatestVersion', () => {
  it('returns the highest version present', () => {
    expect(getLatestVersion(mockRoutes)).toBe('v2');
  });

  it('returns null when no versioned routes exist', () => {
    const unversioned: RouteInfo[] = [{ method: 'GET', path: '/health', middlewares: [] }];
    expect(getLatestVersion(unversioned)).toBeNull();
  });
});

describe('filterByVersion', () => {
  it('filters routes to a specific version', () => {
    const v1Routes = filterByVersion(mockRoutes, 'v1');
    expect(v1Routes).toHaveLength(2);
    expect(v1Routes.every((r) => r.path.startsWith('/v1'))).toBe(true);
  });

  it('returns empty array when version not found', () => {
    expect(filterByVersion(mockRoutes, 'v99')).toHaveLength(0);
  });
});
