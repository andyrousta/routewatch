import {
  setVisibilityAnnotation,
  getVisibilityAnnotation,
  applyVisibilityAnnotations,
  filterByVisibility,
  clearVisibilityRegistry,
  getVisibilitySummary,
  routeKey,
} from './routeVisibilityAnnotator';
import { RouteInfo } from './types';

const makeRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
});

beforeEach(() => {
  clearVisibilityRegistry();
});

describe('routeKey', () => {
  it('normalises method to uppercase', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setVisibilityAnnotation / getVisibilityAnnotation', () => {
  it('stores and retrieves an annotation', () => {
    setVisibilityAnnotation('GET', '/users', { level: 'internal', reason: 'admin only' });
    const result = getVisibilityAnnotation('GET', '/users');
    expect(result).toEqual({ level: 'internal', reason: 'admin only' });
  });

  it('returns undefined for unannotated routes', () => {
    expect(getVisibilityAnnotation('POST', '/unknown')).toBeUndefined();
  });
});

describe('applyVisibilityAnnotations', () => {
  it('attaches visibility fields to matching routes', () => {
    setVisibilityAnnotation('GET', '/secret', { level: 'private' });
    const routes = [makeRoute('GET', '/secret'), makeRoute('GET', '/public')];
    const result = applyVisibilityAnnotations(routes);
    expect((result[0] as any).visibility).toBe('private');
    expect((result[1] as any).visibility).toBeUndefined();
  });
});

describe('filterByVisibility', () => {
  it('keeps routes matching the requested levels', () => {
    setVisibilityAnnotation('GET', '/internal', { level: 'internal' });
    setVisibilityAnnotation('DELETE', '/private', { level: 'private' });
    const routes = [
      makeRoute('GET', '/public'),
      makeRoute('GET', '/internal'),
      makeRoute('DELETE', '/private'),
    ];
    const annotated = applyVisibilityAnnotations(routes);
    const result = filterByVisibility(annotated, ['public', 'internal']);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.path)).toEqual(['/public', '/internal']);
  });
});

describe('getVisibilitySummary', () => {
  it('counts routes by visibility level', () => {
    setVisibilityAnnotation('GET', '/a', { level: 'internal' });
    setVisibilityAnnotation('POST', '/b', { level: 'private' });
    const routes = [
      makeRoute('GET', '/a'),
      makeRoute('POST', '/b'),
      makeRoute('PUT', '/c'),
    ];
    const annotated = applyVisibilityAnnotations(routes);
    const summary = getVisibilitySummary(annotated);
    expect(summary.internal).toBe(1);
    expect(summary.private).toBe(1);
    expect(summary.public).toBe(1);
  });
});
