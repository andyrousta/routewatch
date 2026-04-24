import { formatAsJson, formatAsMarkdown, formatAsSummary } from './routeFormatter';
import { RouteInfo } from './types';

const routes: RouteInfo[] = [
  { method: 'GET', path: '/users', description: 'List users', tags: ['users'] },
  { method: 'POST', path: '/users', description: 'Create user', tags: ['users'] },
  { method: 'GET', path: '/posts', description: 'List posts', tags: ['posts'] },
  { method: 'DELETE', path: '/users/:id', deprecated: true, tags: ['users', 'admin'] },
];

describe('formatAsJson', () => {
  it('returns a DocOutput with routes and timestamp', () => {
    const output = formatAsJson(routes, '1.0.0');
    expect(output.routes).toHaveLength(routes.length);
    expect(output.version).toBe('1.0.0');
    expect(output.generatedAt).toBeDefined();
    expect(new Date(output.generatedAt).getTime()).not.toBeNaN();
  });

  it('works without version', () => {
    const output = formatAsJson(routes);
    expect(output.version).toBeUndefined();
  });
});

describe('formatAsMarkdown', () => {
  it('includes a title heading', () => {
    const md = formatAsMarkdown(routes, 'My API');
    expect(md).toContain('# My API');
  });

  it('groups routes by prefix', () => {
    const md = formatAsMarkdown(routes);
    expect(md).toContain('## /users');
    expect(md).toContain('## /posts');
  });

  it('marks deprecated routes', () => {
    const md = formatAsMarkdown(routes);
    expect(md).toContain('_(deprecated)_');
  });

  it('includes method and path in table rows', () => {
    const md = formatAsMarkdown(routes);
    expect(md).toContain('`GET`');
    expect(md).toContain('`/users`');
  });

  it('uses default title when none provided', () => {
    const md = formatAsMarkdown(routes);
    expect(md).toContain('# API Documentation');
  });
});

describe('formatAsSummary', () => {
  it('returns one line per route', () => {
    const summary = formatAsSummary(routes);
    const lines = summary.split('\n').filter(Boolean);
    expect(lines).toHaveLength(routes.length);
  });

  it('includes method and path on each line', () => {
    const summary = formatAsSummary(routes);
    expect(summary).toContain('GET');
    expect(summary).toContain('/users');
  });
});
