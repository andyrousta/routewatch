import { buildSlaReport, formatSlaReport, generateSlaReport } from './routeSlaReporter';
import { setSlaAnnotation, clearSlaRegistry } from './routeSlaAnnotator';
import { RouteInfo } from './types';

const routes: RouteInfo[] = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/orders' },
  { method: 'DELETE', path: '/api/items' },
];

beforeEach(() => {
  clearSlaRegistry();
});

describe('buildSlaReport', () => {
  it('should return empty array when no SLA annotations set', () => {
    expect(buildSlaReport(routes)).toEqual([]);
  });

  it('should include only annotated routes', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200, priority: 'high' });
    const report = buildSlaReport(routes);
    expect(report).toHaveLength(1);
    expect(report[0].path).toBe('/api/users');
  });

  it('should sort by maxResponseTimeMs ascending', () => {
    setSlaAnnotation('POST', '/api/orders', { maxResponseTimeMs: 500 });
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 100 });
    const report = buildSlaReport(routes);
    expect(report[0].maxResponseTimeMs).toBe(100);
    expect(report[1].maxResponseTimeMs).toBe(500);
  });

  it('should default priority to medium and sloPercentage to N/A', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200 });
    const report = buildSlaReport(routes);
    expect(report[0].priority).toBe('medium');
    expect(report[0].sloPercentage).toBe('N/A');
  });

  it('should format sloPercentage with % sign', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200, sloPercentage: 99.5 });
    const report = buildSlaReport(routes);
    expect(report[0].sloPercentage).toBe('99.5%');
  });
});

describe('formatSlaReport', () => {
  it('should return fallback message when entries are empty', () => {
    expect(formatSlaReport([])).toContain('No SLA annotations found');
  });

  it('should include table headers', () => {
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 100, priority: 'critical' });
    const report = buildSlaReport(routes);
    const output = formatSlaReport(report);
    expect(output).toContain('# SLA Report');
    expect(output).toContain('| Method |');
    expect(output).toContain('critical');
  });
});

describe('generateSlaReport', () => {
  it('should produce a complete markdown report', () => {
    setSlaAnnotation('POST', '/api/orders', { maxResponseTimeMs: 300, priority: 'low', sloPercentage: 95 });
    const output = generateSlaReport(routes);
    expect(output).toContain('/api/orders');
    expect(output).toContain('95%');
  });
});
