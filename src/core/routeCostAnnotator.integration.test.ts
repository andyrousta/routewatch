import express from 'express';
import { extractRoutes } from './routeExtractor';
import { setCostAnnotation, applyCostAnnotations, clearCostRegistry } from './routeCostAnnotator';
import { generateCostReport } from './routeCostReporter';

function buildCostApp() {
  const app = express();
  app.get('/api/reports/annual', (_req, res) => res.json({}));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.post('/api/data/bulk-delete', (_req, res) => res.json({}));
  return app;
}

beforeEach(() => clearCostRegistry());

describe('routeCostAnnotator integration', () => {
  it('annotates and reports costs for extracted routes', () => {
    const app = buildCostApp();
    const routes = extractRoutes(app);

    setCostAnnotation('GET', '/api/reports/annual', { tier: 'high', estimatedMs: 800, notes: 'Heavy aggregation' });
    setCostAnnotation('POST', '/api/data/bulk-delete', { tier: 'critical', estimatedMs: 2000 });

    const annotated = applyCostAnnotations(routes);
    const report = generateCostReport(annotated);

    expect(report).toContain('# Cost Report');
    expect(report).toContain('critical');
    expect(report).toContain('high');
    expect(report).toContain('/api/reports/annual');
    expect(report).toContain('/api/data/bulk-delete');
  });

  it('does not include unannotated routes in cost report', () => {
    const app = buildCostApp();
    const routes = extractRoutes(app);
    const annotated = applyCostAnnotations(routes);
    const report = generateCostReport(annotated);
    expect(report).toContain('No cost annotations found');
  });

  it('summary reflects correct tier counts', () => {
    const app = buildCostApp();
    const routes = extractRoutes(app);
    setCostAnnotation('GET', '/api/health', { tier: 'free' });
    setCostAnnotation('GET', '/api/reports/annual', { tier: 'high' });
    const annotated = applyCostAnnotations(routes);
    const report = generateCostReport(annotated);
    expect(report).toContain('free: 1');
    expect(report).toContain('high: 1');
  });
});
