import {
  setBodyAnnotation,
  getBodyAnnotation,
  applyBodyAnnotations,
  clearBodyRegistry,
  getBodySummary,
  routeKey,
} from './routeBodyAnnotator';
import { RouteInfo } from './types';

const baseRoute: RouteInfo = {
  method: 'POST',
  path: '/users',
};

beforeEach(() => {
  clearBodyRegistry();
});

describe('routeKey', () => {
  it('should produce uppercase method combined with path', () => {
    expect(routeKey('post', '/users')).toBe('POST:/users');
  });
});

describe('setBodyAnnotation / getBodyAnnotation', () => {
  it('should store and retrieve a body schema', () => {
    setBodyAnnotation('POST', '/users', { contentType: 'application/json', required: true });
    const schema = getBodyAnnotation('POST', '/users');
    expect(schema).toEqual({ contentType: 'application/json', required: true });
  });

  it('should return undefined for unannotated routes', () => {
    expect(getBodyAnnotation('GET', '/users')).toBeUndefined();
  });
});

describe('applyBodyAnnotations', () => {
  it('should attach body schema to matching routes', () => {
    setBodyAnnotation('POST', '/users', {
      contentType: 'application/json',
      required: true,
      fields: { name: { type: 'string', required: true } },
    });
    const result = applyBodyAnnotations([baseRoute]);
    expect(result[0]).toHaveProperty('body');
    expect((result[0] as any).body.contentType).toBe('application/json');
  });

  it('should leave routes without annotations unchanged', () => {
    const result = applyBodyAnnotations([{ method: 'GET', path: '/health' }]);
    expect((result[0] as any).body).toBeUndefined();
  });

  it('should not mutate the original route array', () => {
    setBodyAnnotation('POST', '/users', { contentType: 'application/json' });
    const routes = [baseRoute];
    applyBodyAnnotations(routes);
    expect((routes[0] as any).body).toBeUndefined();
  });
});

describe('getBodySummary', () => {
  it('should return all registered body annotations', () => {
    setBodyAnnotation('POST', '/users', { contentType: 'application/json' });
    setBodyAnnotation('PUT', '/users/:id', { contentType: 'application/json', required: false });
    const summary = getBodySummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary['POST:/users']).toBeDefined();
    expect(summary['PUT:/users/:id']).toBeDefined();
  });

  it('should return empty object after clearing registry', () => {
    setBodyAnnotation('POST', '/users', { contentType: 'application/json' });
    clearBodyRegistry();
    expect(getBodySummary()).toEqual({});
  });
});
