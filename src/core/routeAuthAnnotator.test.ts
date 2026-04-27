import {
  setAuthAnnotation,
  getAuthAnnotation,
  applyAuthAnnotations,
  clearAuthRegistry,
  getAuthSummary,
  AuthAnnotation,
} from './routeAuthAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'DELETE', path: '/users/:id', middleware: [] },
];

beforeEach(() => {
  clearAuthRegistry();
});

describe('setAuthAnnotation / getAuthAnnotation', () => {
  it('stores and retrieves an auth annotation', () => {
    const annotation: AuthAnnotation = { scheme: 'bearer', scopes: ['read'] };
    setAuthAnnotation('GET', '/users', annotation);
    expect(getAuthAnnotation('GET', '/users')).toEqual(annotation);
  });

  it('is case-insensitive for method', () => {
    setAuthAnnotation('get', '/users', { scheme: 'basic' });
    expect(getAuthAnnotation('GET', '/users')).toEqual({ scheme: 'basic' });
  });

  it('returns undefined for unregistered routes', () => {
    expect(getAuthAnnotation('GET', '/unknown')).toBeUndefined();
  });
});

describe('applyAuthAnnotations', () => {
  it('annotates matching routes with auth metadata', () => {
    setAuthAnnotation('GET', '/users', { scheme: 'bearer', scopes: ['read'] });
    const result = applyAuthAnnotations(sampleRoutes);
    const annotated = result.find((r) => r.method === 'GET' && r.path === '/users');
    expect(annotated?.metadata?.auth).toEqual({ scheme: 'bearer', scopes: ['read'] });
  });

  it('leaves unannotated routes unchanged', () => {
    const result = applyAuthAnnotations(sampleRoutes);
    expect(result.find((r) => r.path === '/users/:id')?.metadata?.auth).toBeUndefined();
  });

  it('preserves existing metadata', () => {
    const routes: RouteInfo[] = [{ method: 'GET', path: '/users', middleware: [], metadata: { deprecated: true } }];
    setAuthAnnotation('GET', '/users', { scheme: 'apiKey' });
    const result = applyAuthAnnotations(routes);
    expect(result[0].metadata?.deprecated).toBe(true);
    expect(result[0].metadata?.auth).toEqual({ scheme: 'apiKey' });
  });
});

describe('getAuthSummary', () => {
  it('groups routes by auth scheme', () => {
    setAuthAnnotation('GET', '/users', { scheme: 'bearer' });
    setAuthAnnotation('POST', '/users', { scheme: 'apiKey' });
    const summary = getAuthSummary(sampleRoutes);
    expect(summary.bearer).toContain('GET /users');
    expect(summary.apiKey).toContain('POST /users');
    expect(summary.none).toContain('DELETE /users/:id');
  });

  it('returns empty arrays for unused schemes', () => {
    const summary = getAuthSummary([]);
    expect(summary.oauth2).toEqual([]);
  });
});
