import { buildGroupSummaries, formatGroupReport, generateGroupReport } from './routeGroupReporter';
import { setGroupAnnotation, clearGroupRegistry } from './routeGroupAnnotator';
import { RouteInfo } from './types';

const routes: RouteInfo[] = [
  { method: 'GET', path: '/users', middlewares: [] },
  { method: 'POST', path: '/users', middlewares: [] },
  { method: 'GET', path: '/products', middlewares: [] },
  { method: 'GET', path: '/health', middlewares: [] },
];

beforeEach(() => {
  clearGroupRegistry();
});

describe('buildGroupSummaries', () => {
  it('returns summaries per group', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    setGroupAnnotation('POST', '/users', 'Users');
    setGroupAnnotation('GET', '/products', 'Products');

    const summaries = buildGroupSummaries(routes);
    const userGroup = summaries.find((s) => s.group === 'Users');
    const productGroup = summaries.find((s) => s.group === 'Products');

    expect(userGroup).toBeDefined();
    expect(userGroup!.count).toBe(2);
    expect(userGroup!.methods).toContain('GET');
    expect(userGroup!.methods).toContain('POST');
    expect(productGroup).toBeDefined();
    expect(productGroup!.count).toBe(1);
  });

  it('places unannotated routes in default group', () => {
    const summaries = buildGroupSummaries(routes);
    const defaultGroup = summaries.find((s) => s.group === 'default');
    expect(defaultGroup).toBeDefined();
    expect(defaultGroup!.count).toBe(4);
  });

  it('returns empty array for no routes', () => {
    const summaries = buildGroupSummaries([]);
    expect(summaries).toHaveLength(0);
  });
});

describe('formatGroupReport', () => {
  it('returns fallback message when no summaries', () => {
    const output = formatGroupReport([]);
    expect(output).toContain('No route groups found');
  });

  it('includes group names and counts in output', () => {
    setGroupAnnotation('GET', '/users', 'Users');
    const summaries = buildGroupSummaries(routes);
    const output = formatGroupReport(summaries);
    expect(output).toContain('## Users');
    expect(output).toContain('Routes:');
  });
});

describe('generateGroupReport', () => {
  it('produces a markdown report string', () => {
    setGroupAnnotation('GET', '/health', 'Ops');
    const report = generateGroupReport(routes);
    expect(typeof report).toBe('string');
    expect(report).toContain('Route Group Report');
  });
});
