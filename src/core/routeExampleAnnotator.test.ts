import {
  setExampleAnnotation,
  getExampleAnnotation,
  applyExampleAnnotations,
  clearExampleRegistry,
  getExampleSummary,
  routeKey,
} from './routeExampleAnnotator';
import { RouteInfo } from './types';

const baseRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
  params: [],
});

beforeEach(() => {
  clearExampleRegistry();
});

describe('routeKey', () => {
  it('should normalise method to uppercase', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setExampleAnnotation / getExampleAnnotation', () => {
  it('should store and retrieve examples', () => {
    setExampleAnnotation('GET', '/users', {
      request: null,
      response: { id: 1, name: 'Alice' },
    });
    const result = getExampleAnnotation('GET', '/users');
    expect(result).toEqual({ request: null, response: { id: 1, name: 'Alice' } });
  });

  it('should return undefined for unknown routes', () => {
    expect(getExampleAnnotation('POST', '/unknown')).toBeUndefined();
  });

  it('should overwrite existing examples', () => {
    setExampleAnnotation('GET', '/users', { response: { old: true } });
    setExampleAnnotation('GET', '/users', { response: { new: true } });
    expect(getExampleAnnotation('GET', '/users')).toEqual({ response: { new: true } });
  });
});

describe('applyExampleAnnotations', () => {
  it('should attach examples to matching routes', () => {
    setExampleAnnotation('POST', '/items', {
      request: { name: 'Widget' },
      response: { id: 42, name: 'Widget' },
    });
    const routes = [baseRoute('POST', '/items'), baseRoute('GET', '/items')];
    const annotated = applyExampleAnnotations(routes);
    expect(annotated[0].metadata?.examples).toEqual({
      request: { name: 'Widget' },
      response: { id: 42, name: 'Widget' },
    });
    expect(annotated[1].metadata?.examples).toBeUndefined();
  });

  it('should preserve existing metadata', () => {
    setExampleAnnotation('GET', '/ping', { response: 'pong' });
    const routes = [{ ...baseRoute('GET', '/ping'), metadata: { deprecated: false } }];
    const annotated = applyExampleAnnotations(routes);
    expect(annotated[0].metadata?.deprecated).toBe(false);
    expect(annotated[0].metadata?.examples).toEqual({ response: 'pong' });
  });
});

describe('clearExampleRegistry', () => {
  it('should remove all registered examples', () => {
    setExampleAnnotation('DELETE', '/resource', { response: { ok: true } });
    clearExampleRegistry();
    expect(getExampleSummary()).toEqual({});
  });
});

describe('getExampleSummary', () => {
  it('should return a snapshot of the registry', () => {
    setExampleAnnotation('GET', '/a', { response: 'a' });
    setExampleAnnotation('GET', '/b', { response: 'b' });
    const summary = getExampleSummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary['GET:/a']).toEqual({ response: 'a' });
  });
});
