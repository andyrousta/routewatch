import {
  buildEnvironmentReport,
  formatEnvironmentReport,
  generateEnvironmentReport,
} from './routeEnvironmentReporter';
import {
  setEnvironmentAnnotation,
  clearEnvironmentRegistry,
} from './routeEnvironmentAnnotator';
import { RouteInfo } from './types';

const routes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'GET', path: '/admin', middleware: [] },
];

beforeEach(() => {
  clearEnvironmentRegistry();
});

describe('buildEnvironmentReport', () => {
  it('groups routes by environment', () => {
    setEnvironmentAnnotation('GET', '/users', ['production']);
    setEnvironmentAnnotation('GET', '/admin', ['staging']);

    const report = buildEnvironmentReport(routes);

    expect(report['production'].some((r) => r.path === '/users')).toBe(true);
    expect(report['staging'].some((r) => r.path === '/admin')).toBe(true);
  });

  it('places unannotated routes under "all"', () => {
    const report = buildEnvironmentReport(routes);
    expect(report['all']).toHaveLength(routes.length);
  });

  it('returns empty object when no routes are provided', () => {
    const report = buildEnvironmentReport([]);
    expect(Object.keys(report)).toHaveLength(0);
  });
});

describe('formatEnvironmentReport', () => {
  it('produces a markdown-style report', () => {
    setEnvironmentAnnotation('GET', '/users', ['production']);
    const output = formatEnvironmentReport(routes);
    expect(output).toContain('# Environment Report');
    expect(output).toContain('## production');
    expect(output).toContain('[GET] /users');
  });

  it('handles routes with no annotations gracefully', () => {
    const output = formatEnvironmentReport(routes);
    expect(output).toContain('## all');
  });
});

describe('generateEnvironmentReport', () => {
  it('delegates to formatEnvironmentReport', () => {
    setEnvironmentAnnotation('POST', '/users', ['development']);
    const output = generateEnvironmentReport(routes);
    expect(output).toContain('## development');
    expect(output).toContain('[POST] /users');
  });
});
