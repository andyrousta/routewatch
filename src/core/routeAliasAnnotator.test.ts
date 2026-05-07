import {
  setAliasAnnotation,
  getAliasAnnotation,
  applyAliasAnnotations,
  clearAliasRegistry,
  getAliasSummary,
  routeKey,
} from './routeAliasAnnotator';
import { RouteInfo } from './types';

const baseRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
});

beforeEach(() => {
  clearAliasRegistry();
});

describe('routeKey', () => {
  it('should produce uppercase method key', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setAliasAnnotation / getAliasAnnotation', () => {
  it('should store and retrieve aliases for a route', () => {
    setAliasAnnotation('GET', '/users', ['/members', '/people']);
    expect(getAliasAnnotation('GET', '/users')).toEqual(['/members', '/people']);
  });

  it('should return empty array for unknown route', () => {
    expect(getAliasAnnotation('POST', '/unknown')).toEqual([]);
  });
});

describe('applyAliasAnnotations', () => {
  it('should annotate routes that have aliases', () => {
    setAliasAnnotation('GET', '/users', ['/members']);
    const routes = [baseRoute('GET', '/users'), baseRoute('POST', '/users')];
    const result = applyAliasAnnotations(routes);
    expect((result[0] as any).aliases).toEqual(['/members']);
    expect((result[1] as any).aliases).toBeUndefined();
  });

  it('should not mutate original route objects', () => {
    setAliasAnnotation('GET', '/items', ['/things']);
    const route = baseRoute('GET', '/items');
    const [annotated] = applyAliasAnnotations([route]);
    expect(route).not.toHaveProperty('aliases');
    expect((annotated as any).aliases).toEqual(['/things']);
  });
});

describe('clearAliasRegistry', () => {
  it('should remove all stored aliases', () => {
    setAliasAnnotation('GET', '/a', ['/b']);
    clearAliasRegistry();
    expect(getAliasAnnotation('GET', '/a')).toEqual([]);
  });
});

describe('getAliasSummary', () => {
  it('should return a snapshot of the registry', () => {
    setAliasAnnotation('DELETE', '/posts', ['/articles']);
    const summary = getAliasSummary();
    expect(summary['DELETE:/posts']).toEqual(['/articles']);
  });
});
