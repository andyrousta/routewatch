import {
  setGroupAnnotation,
  getGroupAnnotation,
  applyGroupAnnotations,
  clearGroupRegistry,
  groupRoutesByAnnotation,
} from './routeGroupAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middlewares: [] },
  { method: 'POST', path: '/users', middlewares: [] },
  { method: 'GET', path: '/products', middlewares: [] },
];

beforeEach(() => {
  clearGroupRegistry();
});

describe('setGroupAnnotation / getGroupAnnotation', () => {
  it('stores and retrieves a group annotation', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    expect(getGroupAnnotation('GET', '/users')).toBe('Users');
  });

  it('returns undefined for unannotated routes', () => {
    expect(getGroupAnnotation('DELETE', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    setGroupAnnotation('get', '/users', 'Users');
    expect(getGroupAnnotation('GET', '/users')).toBe('Users');
  });
});

describe('applyGroupAnnotations', () => {
  it('applies group field to matching routes', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    const result = applyGroupAnnotations(sampleRoutes);
    const route = result.find((r) => r.method === 'GET' && r.path === '/users');
    expect((route as any).group).toBe('Users');
  });

  it('leaves unannotated routes unchanged', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    const result = applyGroupAnnotations(sampleRoutes);
    const route = result.find((r) => r.method === 'GET' && r.path === '/products');
    expect((route as any).group).toBeUndefined();
  });
});

describe('groupRoutesByAnnotation', () => {
  it('groups routes by their annotation', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    setGroupAnnotation('POST', '/users', 'Users');
    setGroupAnnotation('GET', '/products', 'Products');
    const groups = groupRoutesByAnnotation(sampleRoutes);
    expect(groups['Users']).toHaveLength(2);
    expect(groups['Products']).toHaveLength(1);
  });

  it('places unannotated routes in default group', () => {
    const groups = groupRoutesByAnnotation(sampleRoutes);
    expect(groups['default']).toHaveLength(3);
  });

  it('returns empty object for empty routes', () => {
    const groups = groupRoutesByAnnotation([]);
    expect(Object.keys(groups)).toHaveLength(0);
  });
});
