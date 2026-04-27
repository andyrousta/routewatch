import {
  setResponseAnnotations,
  getResponseAnnotations,
  applyResponseAnnotations,
  clearResponseRegistry,
  getResponseSummary,
  routeKey,
} from './routeResponseAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'DELETE', path: '/users/:id', middleware: [] },
];

beforeEach(() => {
  clearResponseRegistry();
});

describe('routeKey', () => {
  it('should combine method and path into a key', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setResponseAnnotations / getResponseAnnotations', () => {
  it('should store and retrieve annotations', () => {
    setResponseAnnotations('GET', '/users', [
      { statusCode: 200, description: 'Success' },
      { statusCode: 404, description: 'Not found' },
    ]);
    const result = getResponseAnnotations('GET', '/users');
    expect(result).toHaveLength(2);
    expect(result[0].statusCode).toBe(200);
  });

  it('should return empty array for unregistered route', () => {
    expect(getResponseAnnotations('GET', '/unknown')).toEqual([]);
  });

  it('should overwrite existing annotations', () => {
    setResponseAnnotations('GET', '/users', [{ statusCode: 200, description: 'OK' }]);
    setResponseAnnotations('GET', '/users', [{ statusCode: 201, description: 'Created' }]);
    const result = getResponseAnnotations('GET', '/users');
    expect(result).toHaveLength(1);
    expect(result[0].statusCode).toBe(201);
  });
});

describe('applyResponseAnnotations', () => {
  it('should attach responses to matching routes', () => {
    setResponseAnnotations('GET', '/users', [{ statusCode: 200, description: 'OK' }]);
    const annotated = applyResponseAnnotations(sampleRoutes);
    const userRoute = annotated.find((r) => r.method === 'GET' && r.path === '/users');
    expect(userRoute?.metadata?.responses).toBeDefined();
    expect(userRoute?.metadata?.responses).toHaveLength(1);
  });

  it('should not modify routes without annotations', () => {
    const annotated = applyResponseAnnotations(sampleRoutes);
    annotated.forEach((r) => {
      expect(r.metadata?.responses).toBeUndefined();
    });
  });
});

describe('getResponseSummary', () => {
  it('should return only routes with annotations', () => {
    setResponseAnnotations('POST', '/users', [{ statusCode: 201, description: 'Created' }]);
    const summary = getResponseSummary(sampleRoutes);
    expect(Object.keys(summary)).toHaveLength(1);
    expect(summary['POST:/users']).toBeDefined();
  });

  it('should return empty object when no annotations exist', () => {
    expect(getResponseSummary(sampleRoutes)).toEqual({});
  });
});
