import {
  setStabilityAnnotation,
  getStabilityAnnotation,
  applyStabilityAnnotations,
  clearStabilityRegistry,
  getStabilitySummary,
} from './routeStabilityAnnotator';
import { RouteInfo } from './types';

const mockRoutes: RouteInfo[] = [
  { method: 'GET', path: '/api/v1/users' },
  { method: 'POST', path: '/api/v1/users' },
  { method: 'GET', path: '/api/v2/users' },
];

beforeEach(() => {
  clearStabilityRegistry();
});

describe('setStabilityAnnotation / getStabilityAnnotation', () => {
  it('stores and retrieves a stability annotation', () => {
    setStabilityAnnotation('GET', '/api/v1/users', { level: 'stable', since: '1.0.0' });
    const result = getStabilityAnnotation('GET', '/api/v1/users');
    expect(result).toEqual({ level: 'stable', since: '1.0.0' });
  });

  it('returns undefined for unannotated routes', () => {
    expect(getStabilityAnnotation('DELETE', '/api/v1/users')).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    setStabilityAnnotation('get', '/api/v1/users', { level: 'beta' });
    expect(getStabilityAnnotation('GET', '/api/v1/users')).toEqual({ level: 'beta' });
  });
});

describe('applyStabilityAnnotations', () => {
  it('merges stability fields onto matching routes', () => {
    setStabilityAnnotation('GET', '/api/v1/users', {
      level: 'stable',
      since: '1.0.0',
      note: 'Production ready',
    });
    const result = applyStabilityAnnotations(mockRoutes);
    const target = result.find((r) => r.method === 'GET' && r.path === '/api/v1/users') as Record<string, unknown>;
    expect(target?.stability).toBe('stable');
    expect(target?.stabilitySince).toBe('1.0.0');
    expect(target?.stabilityNote).toBe('Production ready');
  });

  it('leaves unannotated routes unchanged', () => {
    const result = applyStabilityAnnotations(mockRoutes);
    const target = result.find((r) => r.method === 'POST') as Record<string, unknown>;
    expect(target?.stability).toBeUndefined();
  });
});

describe('getStabilitySummary', () => {
  it('counts routes by stability level', () => {
    setStabilityAnnotation('GET', '/api/v1/users', { level: 'stable' });
    setStabilityAnnotation('POST', '/api/v1/users', { level: 'beta' });
    setStabilityAnnotation('GET', '/api/v2/users', { level: 'experimental' });
    const summary = getStabilitySummary(mockRoutes);
    expect(summary.stable).toBe(1);
    expect(summary.beta).toBe(1);
    expect(summary.experimental).toBe(1);
    expect(summary.deprecated).toBe(0);
  });

  it('returns all zeros when no annotations are set', () => {
    const summary = getStabilitySummary(mockRoutes);
    expect(Object.values(summary).every((v) => v === 0)).toBe(true);
  });
});

describe('clearStabilityRegistry', () => {
  it('removes all registered annotations', () => {
    setStabilityAnnotation('GET', '/api/v1/users', { level: 'stable' });
    clearStabilityRegistry();
    expect(getStabilityAnnotation('GET', '/api/v1/users')).toBeUndefined();
  });
});
