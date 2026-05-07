import { buildScoreReport, formatScoreReport, generateScoreReport, RouteScoreEntry } from './routeScoreReporter';
import { RouteInfo } from './types';
import { clearScoreRegistry, setRouteScore } from './routeScoreAnnotator';

beforeEach(() => {
  clearScoreRegistry();
});

const stableRoute: RouteInfo = { method: 'GET', path: '/api/users', summary: 'List users' };
const bareRoute: RouteInfo = { method: 'DELETE', path: '/api/items' };

describe('buildScoreReport', () => {
  it('returns entries for each route', () => {
    const report = buildScoreReport([stableRoute, bareRoute]);
    expect(report.entries).toHaveLength(2);
  });

  it('computes averageTotal', () => {
    setRouteScore('GET', '/api/users', { total: 80, breakdown: { documentation: 25, stability: 25, security: 25, performance: 5 } });
    setRouteScore('DELETE', '/api/items', { total: 20, breakdown: { documentation: 0, stability: 5, security: 0, performance: 15 } });
    const report = buildScoreReport([stableRoute, bareRoute]);
    expect(report.averageTotal).toBe(50);
  });

  it('identifies lowestScored and highestScored', () => {
    setRouteScore('GET', '/api/users', { total: 90, breakdown: { documentation: 25, stability: 25, security: 25, performance: 15 } });
    setRouteScore('DELETE', '/api/items', { total: 10, breakdown: { documentation: 0, stability: 5, security: 0, performance: 5 } });
    const report = buildScoreReport([stableRoute, bareRoute]);
    expect(report.lowestScored?.path).toBe('/api/items');
    expect(report.highestScored?.path).toBe('/api/users');
  });

  it('handles empty routes', () => {
    const report = buildScoreReport([]);
    expect(report.entries).toHaveLength(0);
    expect(report.averageTotal).toBe(0);
    expect(report.lowestScored).toBeNull();
    expect(report.highestScored).toBeNull();
  });

  it('assigns correct grades', () => {
    setRouteScore('GET', '/api/users', { total: 95, breakdown: { documentation: 25, stability: 25, security: 25, performance: 20 } });
    const report = buildScoreReport([stableRoute]);
    expect(report.entries[0].grade).toBe('A');
  });
});

describe('formatScoreReport', () => {
  it('includes header and average score', () => {
    const report = buildScoreReport([stableRoute]);
    const output = formatScoreReport(report);
    expect(output).toContain('# Route Score Report');
    expect(output).toContain('Average Score');
  });

  it('includes route rows', () => {
    const report = buildScoreReport([stableRoute]);
    const output = formatScoreReport(report);
    expect(output).toContain('/api/users');
    expect(output).toContain('GET');
  });
});

describe('generateScoreReport', () => {
  it('returns a non-empty string', () => {
    const output = generateScoreReport([stableRoute, bareRoute]);
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });
});
