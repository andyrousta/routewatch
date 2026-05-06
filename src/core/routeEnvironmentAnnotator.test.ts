import {
  setEnvironmentAnnotation,
  getEnvironmentAnnotation,
  applyEnvironmentAnnotations,
  filterByEnvironment,
  clearEnvironmentRegistry,
  getEnvironmentSummary,
} from './routeEnvironmentAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'DELETE', path: '/admin/users', middleware: [] },
];

beforeEach(() => {
  clearEnvironmentRegistry();
});

describe('setEnvironmentAnnotation / getEnvironmentAnnotation', () => {
  it('stores and retrieves an annotation', () => {
    setEnvironmentAnnotation('GET', '/users', ['production', 'staging']);
    const result = getEnvironmentAnnotation('GET', '/users');
    expect(result).toEqual({ environments: ['production', 'staging'] });
  });

  it('returns undefined for unannotated routes', () => {
    expect(getEnvironmentAnnotation('GET', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive on method', () => {
    setEnvironmentAnnotation('get', '/users', ['development']);
    expect(getEnvironmentAnnotation('GET', '/users')).toEqual({
      environments: ['development'],
    });
  });
});

describe('applyEnvironmentAnnotations', () => {
  it('merges environment annotations into routes', () => {
    setEnvironmentAnnotation('GET', '/users', ['production']);
    const annotated = applyEnvironmentAnnotations(sampleRoutes);
    expect(annotated[0].environments).toEqual(['production']);
    expect(annotated[1].environments).toBeUndefined();
  });
});

describe('filterByEnvironment', () => {
  it('keeps routes available in the given environment', () => {
    setEnvironmentAnnotation('DELETE', '/admin/users', ['staging']);
    const annotated = applyEnvironmentAnnotations(sampleRoutes);
    const filtered = filterByEnvironment(annotated, 'production');
    expect(filtered.some((r) => r.path === '/admin/users')).toBe(false);
    expect(filtered.some((r) => r.path === '/users')).toBe(true);
  });

  it('includes routes with no environment annotation', () => {
    const annotated = applyEnvironmentAnnotations(sampleRoutes);
    const filtered = filterByEnvironment(annotated, 'production');
    expect(filtered).toHaveLength(sampleRoutes.length);
  });
});

describe('getEnvironmentSummary', () => {
  it('counts routes per environment', () => {
    setEnvironmentAnnotation('GET', '/users', ['production', 'staging']);
    setEnvironmentAnnotation('POST', '/users', ['production']);
    const annotated = applyEnvironmentAnnotations(sampleRoutes);
    const summary = getEnvironmentSummary(annotated);
    expect(summary['production']).toBe(2);
    expect(summary['staging']).toBe(1);
    expect(summary['all']).toBe(1); // DELETE /admin/users has no annotation
  });
});
