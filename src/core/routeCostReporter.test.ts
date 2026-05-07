import { buildCostReport, formatCostReport, generateCostReport } from './routeCostReporter';
import { setCostAnnotation, clearCostRegistry } from './routeCostAnnotator';
import { RouteInfo } from './types';

const route = (method: string, path: string): RouteInfo => ({ method, path });

beforeEach(() => clearCostRegistry());

describe('buildCostReport', () => {
  it('returns entries for annotated routes only', () => {
    setCostAnnotation('GET', '/reports', { tier: 'high', estimatedMs: 400 });
    const routes = [route('GET', '/reports'), route('GET', '/health')];
    const result = buildCostReport(routes);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/reports');
    expect(result[0].tier).toBe('high');
  });

  it('sorts entries by tier descending (critical first)', () => {
    setCostAnnotation('GET', '/a', { tier: 'low' });
    setCostAnnotation('POST', '/b', { tier: 'critical' });
    setCostAnnotation('GET', '/c', { tier: 'medium' });
    const routes = [route('GET', '/a'), route('POST', '/b'), route('GET', '/c')];
    const result = buildCostReport(routes);
    expect(result[0].tier).toBe('critical');
    expect(result[1].tier).toBe('medium');
    expect(result[2].tier).toBe('low');
  });

  it('returns empty array when no annotations exist', () => {
    const result = buildCostReport([route('GET', '/ping')]);
    expect(result).toEqual([]);
  });
});

describe('formatCostReport', () => {
  it('returns fallback message for empty entries', () => {
    const output = formatCostReport([]);
    expect(output).toContain('No cost annotations found');
  });

  it('includes method, path, tier in output', () => {
    setCostAnnotation('DELETE', '/data', { tier: 'critical', estimatedMs: 1000, notes: 'Bulk delete' });
    const entries = buildCostReport([route('DELETE', '/data')]);
    const output = formatCostReport(entries);
    expect(output).toContain('DELETE');
    expect(output).toContain('/data');
    expect(output).toContain('critical');
    expect(output).toContain('1000ms');
    expect(output).toContain('Bulk delete');
  });

  it('includes summary line', () => {
    setCostAnnotation('GET', '/x', { tier: 'high' });
    const entries = buildCostReport([route('GET', '/x')]);
    const output = formatCostReport(entries);
    expect(output).toContain('high: 1');
  });
});

describe('generateCostReport', () => {
  it('returns a formatted markdown string', () => {
    setCostAnnotation('GET', '/slow', { tier: 'medium' });
    const output = generateCostReport([route('GET', '/slow')]);
    expect(output).toContain('# Cost Report');
    expect(output).toContain('/slow');
  });
});
