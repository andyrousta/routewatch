import {
  setMiddlewareAnnotation,
  getMiddlewareAnnotation,
  applyMiddlewareAnnotations,
  clearMiddlewareRegistry,
  getMiddlewareSummary,
  routeKey,
} from './routeMiddlewareAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', params: [] },
  { method: 'POST', path: '/users', params: [] },
  { method: 'DELETE', path: '/users/:id', params: ['id'] },
];

beforeEach(() => {
  clearMiddlewareRegistry();
});

describe('routeKey', () => {
  it('should produce an uppercase method:path key', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setMiddlewareAnnotation / getMiddlewareAnnotation', () => {
  it('should store and retrieve middleware annotation', () => {
    setMiddlewareAnnotation('GET', '/users', ['authMiddleware', 'rateLimiter']);
    const result = getMiddlewareAnnotation('GET', '/users');
    expect(result).toEqual({ middlewares: ['authMiddleware', 'rateLimiter'] });
  });

  it('should return undefined for unannotated routes', () => {
    expect(getMiddlewareAnnotation('GET', '/unknown')).toBeUndefined();
  });
});

describe('applyMiddlewareAnnotations', () => {
  it('should annotate matching routes with middleware info', () => {
    setMiddlewareAnnotation('GET', '/users', ['authMiddleware']);
    const annotated = applyMiddlewareAnnotations(sampleRoutes);
    const target = annotated.find((r) => r.method === 'GET' && r.path === '/users');
    expect(target?.metadata?.middlewares).toEqual(['authMiddleware']);
  });

  it('should leave unannotated routes unchanged', () => {
    const annotated = applyMiddlewareAnnotations(sampleRoutes);
    const target = annotated.find((r) => r.method === 'POST' && r.path === '/users');
    expect(target?.metadata?.middlewares).toBeUndefined();
  });

  it('should merge with existing metadata', () => {
    const routesWithMeta: RouteInfo[] = [
      { method: 'GET', path: '/users', params: [], metadata: { auth: 'bearer' } },
    ];
    setMiddlewareAnnotation('GET', '/users', ['cors']);
    const annotated = applyMiddlewareAnnotations(routesWithMeta);
    expect(annotated[0].metadata).toEqual({ auth: 'bearer', middlewares: ['cors'] });
  });
});

describe('getMiddlewareSummary', () => {
  it('should return a summary of all registered middleware annotations', () => {
    setMiddlewareAnnotation('GET', '/users', ['authMiddleware']);
    setMiddlewareAnnotation('POST', '/users', ['rateLimiter']);
    const summary = getMiddlewareSummary();
    expect(summary['GET:/users']).toEqual(['authMiddleware']);
    expect(summary['POST:/users']).toEqual(['rateLimiter']);
  });

  it('should return empty object when registry is clear', () => {
    expect(getMiddlewareSummary()).toEqual({});
  });
});
