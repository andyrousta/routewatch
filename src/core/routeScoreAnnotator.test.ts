import {
  setRouteScore,
  getRouteScore,
  computeScore,
  applyScoreAnnotations,
  clearScoreRegistry,
  routeKey,
  RouteScore,
} from './routeScoreAnnotator';
import { RouteInfo } from './types';

const baseRoute: RouteInfo = { method: 'GET', path: '/api/users', summary: 'List users' };

beforeEach(() => {
  clearScoreRegistry();
});

describe('routeKey', () => {
  it('formats key as METHOD:path', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setRouteScore / getRouteScore', () => {
  it('stores and retrieves a score', () => {
    const score: RouteScore = { total: 80, breakdown: { documentation: 25, stability: 25, security: 25, performance: 5 } };
    setRouteScore('GET', '/api/users', score);
    expect(getRouteScore('GET', '/api/users')).toEqual(score);
  });

  it('returns undefined for unknown route', () => {
    expect(getRouteScore('POST', '/unknown')).toBeUndefined();
  });
});

describe('computeScore', () => {
  it('awards documentation points when summary present', () => {
    const score = computeScore(baseRoute);
    expect(score.breakdown.documentation).toBe(25);
  });

  it('awards zero documentation points when no summary', () => {
    const score = computeScore({ method: 'GET', path: '/no-summary' });
    expect(score.breakdown.documentation).toBe(0);
  });

  it('computes total as sum of breakdown', () => {
    const score = computeScore(baseRoute);
    const expected = Object.values(score.breakdown).reduce((s, v) => s + v, 0);
    expect(score.total).toBe(expected);
  });
});

describe('applyScoreAnnotations', () => {
  it('annotates each route with a score', () => {
    const routes = [baseRoute, { method: 'POST', path: '/api/users' }];
    const annotated = applyScoreAnnotations(routes) as any[];
    expect(annotated[0].score).toBeDefined();
    expect(annotated[1].score).toBeDefined();
  });

  it('uses registry score when available', () => {
    const custom: RouteScore = { total: 99, breakdown: { documentation: 25, stability: 25, security: 25, performance: 24 } };
    setRouteScore('GET', '/api/users', custom);
    const annotated = applyScoreAnnotations([baseRoute]) as any[];
    expect(annotated[0].score.total).toBe(99);
  });
});

describe('clearScoreRegistry', () => {
  it('removes all entries', () => {
    setRouteScore('GET', '/api/users', { total: 50, breakdown: { documentation: 25, stability: 25, security: 0, performance: 0 } });
    clearScoreRegistry();
    expect(getRouteScore('GET', '/api/users')).toBeUndefined();
  });
});
