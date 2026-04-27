import express from 'express';
import { extractRoutes } from './routeExtractor';
import { generateSummaryReport, formatSummaryReport } from './routeSummaryReporter';
import { applyDeprecations } from './routeDeprecator';
import { applyTags } from './routeTagging';

function buildTestApp() {
  const app = express();
  app.get('/api/v1/users', (_req, res) => res.json([]));
  app.post('/api/v1/users', (_req, res) => res.json({}));
  app.get('/api/v2/users', (_req, res) => res.json([]));
  app.delete('/api/v1/users/:id', (_req, res) => res.json({}));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return app;
}

describe('routeSummaryReporter integration', () => {
  let routes: ReturnType<typeof extractRoutes>;

  beforeEach(() => {
    const app = buildTestApp();
    routes = extractRoutes(app);
  });

  it('generates a report from real extracted routes', () => {
    const report = generateSummaryReport(routes);
    expect(report.totalRoutes).toBeGreaterThanOrEqual(5);
    expect(report.byMethod['GET']).toBeGreaterThanOrEqual(3);
  });

  it('reflects deprecated routes after applyDeprecations', () => {
    const deprecated = applyDeprecations(routes, [
      { method: 'DELETE', path: '/api/v1/users/:id' },
    ]);
    const report = generateSummaryReport(deprecated);
    expect(report.deprecatedCount).toBeGreaterThanOrEqual(1);
  });

  it('reflects tagged routes after applyTags', () => {
    const tagged = applyTags(routes, [
      { method: 'GET', path: '/health', tags: ['monitoring'] },
    ]);
    const report = generateSummaryReport(tagged);
    expect(report.taggedCount).toBeGreaterThanOrEqual(1);
  });

  it('produces non-empty formatted output', () => {
    const report = generateSummaryReport(routes);
    const output = formatSummaryReport(report);
    expect(output.length).toBeGreaterThan(50);
    expect(output).toContain('Route Summary Report');
  });

  it('lists /api as a top prefix', () => {
    const report = generateSummaryReport(routes);
    const prefixes = report.topPrefixes.map((p) => p.prefix);
    expect(prefixes).toContain('/api');
  });
});
