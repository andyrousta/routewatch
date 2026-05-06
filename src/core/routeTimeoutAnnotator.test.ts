import {
  setTimeout,
  getTimeout,
  applyTimeoutAnnotations,
  clearTimeoutRegistry,
  getTimeoutSummary,
  routeKey,
} from './routeTimeoutAnnotator';
import { RouteInfo } from './types';

const baseRoute: RouteInfo = {
  method: 'GET',
  path: '/api/slow',
};

beforeEach(() => {
  clearTimeoutRegistry();
});

describe('routeKey', () => {
  it('formats method and path into a key', () => {
    expect(routeKey('get', '/api/test')).toBe('GET:/api/test');
  });
});

describe('setTimeout / getTimeout', () => {
  it('stores and retrieves a timeout annotation', () => {
    setTimeout('GET', '/api/slow', { ms: 5000, message: 'Request timed out' });
    expect(getTimeout('GET', '/api/slow')).toEqual({
      ms: 5000,
      message: 'Request timed out',
    });
  });

  it('returns undefined for unannotated routes', () => {
    expect(getTimeout('POST', '/api/fast')).toBeUndefined();
  });

  it('stores timeout without optional message', () => {
    setTimeout('DELETE', '/api/resource', { ms: 3000 });
    expect(getTimeout('DELETE', '/api/resource')).toEqual({ ms: 3000 });
  });
});

describe('applyTimeoutAnnotations', () => {
  it('annotates matching routes with timeout info', () => {
    setTimeout('GET', '/api/slow', { ms: 8000 });
    const result = applyTimeoutAnnotations([baseRoute]);
    expect(result[0]).toMatchObject({ timeout: { ms: 8000 } });
  });

  it('leaves non-matching routes unchanged', () => {
    const route: RouteInfo = { method: 'POST', path: '/api/other' };
    const result = applyTimeoutAnnotations([route]);
    expect((result[0] as any).timeout).toBeUndefined();
  });

  it('handles an empty route list', () => {
    expect(applyTimeoutAnnotations([])).toEqual([]);
  });
});

describe('getTimeoutSummary', () => {
  it('returns all registered timeouts', () => {
    setTimeout('GET', '/api/slow', { ms: 5000 });
    setTimeout('POST', '/api/upload', { ms: 30000, message: 'Upload timeout' });
    const summary = getTimeoutSummary();
    expect(Object.keys(summary)).toHaveLength(2);
    expect(summary['GET:/api/slow']).toEqual({ ms: 5000 });
  });

  it('returns empty object when registry is clear', () => {
    expect(getTimeoutSummary()).toEqual({});
  });
});

describe('clearTimeoutRegistry', () => {
  it('removes all registered entries', () => {
    setTimeout('GET', '/api/slow', { ms: 1000 });
    clearTimeoutRegistry();
    expect(getTimeoutSummary()).toEqual({});
  });
});
