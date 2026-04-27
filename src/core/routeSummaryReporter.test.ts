import {
  computePathDepth,
  extractTopPrefix,
  generateSummaryReport,
  formatSummaryReport,
} from './routeSummaryReporter';
import { RouteInfo } from './types';

const mockRoutes: RouteInfo[] = [
  { method: 'GET', path: '/api/v1/users' },
  { method: 'POST', path: '/api/v1/users' },
  { method: 'GET', path: '/api/v1/posts' },
  { method: 'DELETE', path: '/api/v2/users/:id', deprecated: true } as any,
  { method: 'GET', path: '/health', tags: ['system'] } as any,
];

describe('computePathDepth', () => {
  it('returns 0 for root path', () => {
    expect(computePathDepth('/')).toBe(0);
  });

  it('returns correct depth for nested path', () => {
    expect(computePathDepth('/api/v1/users')).toBe(3);
  });

  it('handles paths without leading slash segment', () => {
    expect(computePathDepth('/health')).toBe(1);
  });
});

describe('extractTopPrefix', () => {
  it('extracts first segment as prefix', () => {
    expect(extractTopPrefix('/api/v1/users')).toBe('/api');
  });

  it('returns / for root path', () => {
    expect(extractTopPrefix('/')).toBe('/');
  });

  it('handles single segment path', () => {
    expect(extractTopPrefix('/health')).toBe('/health');
  });
});

describe('generateSummaryReport', () => {
  it('counts total routes', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.totalRoutes).toBe(5);
  });

  it('groups routes by method', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.byMethod['GET']).toBe(3);
    expect(report.byMethod['POST']).toBe(1);
    expect(report.byMethod['DELETE']).toBe(1);
  });

  it('groups routes by version', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.byVersion['v1']).toBe(3);
    expect(report.byVersion['v2']).toBe(1);
    expect(report.byVersion['unversioned']).toBe(1);
  });

  it('counts deprecated routes', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.deprecatedCount).toBe(1);
  });

  it('counts tagged routes', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.taggedCount).toBe(1);
  });

  it('returns 0 averagePathDepth for empty routes', () => {
    const report = generateSummaryReport([]);
    expect(report.averagePathDepth).toBe(0);
  });

  it('returns top prefixes sorted by count', () => {
    const report = generateSummaryReport(mockRoutes);
    expect(report.topPrefixes[0].prefix).toBe('/api');
  });
});

describe('formatSummaryReport', () => {
  it('includes total route count in output', () => {
    const report = generateSummaryReport(mockRoutes);
    const output = formatSummaryReport(report);
    expect(output).toContain('Total Routes: 5');
  });

  it('includes method breakdown', () => {
    const report = generateSummaryReport(mockRoutes);
    const output = formatSummaryReport(report);
    expect(output).toContain('GET: 3');
  });

  it('includes version breakdown', () => {
    const report = generateSummaryReport(mockRoutes);
    const output = formatSummaryReport(report);
    expect(output).toContain('v1: 3');
  });
});
