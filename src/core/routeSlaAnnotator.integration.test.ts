import express from 'express';
import { extractRoutes } from './routeExtractor';
import { setSlaAnnotation, applySlaAnnotations, clearSlaRegistry } from './routeSlaAnnotator';
import { generateSlaReport } from './routeSlaReporter';

function buildSlaApp() {
  const app = express();
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/orders', (_req, res) => res.status(201).json({}));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  return app;
}

beforeEach(() => {
  clearSlaRegistry();
});

describe('SLA annotator integration', () => {
  it('should annotate extracted routes with SLA metadata', () => {
    const app = buildSlaApp();
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 150, priority: 'high', sloPercentage: 99.9 });
    setSlaAnnotation('POST', '/api/orders', { maxResponseTimeMs: 400, priority: 'medium' });

    const routes = extractRoutes(app);
    const annotated = applySlaAnnotations(routes);

    const usersRoute = annotated.find((r) => r.method === 'GET' && r.path === '/api/users');
    expect(usersRoute?.meta?.sla?.maxResponseTimeMs).toBe(150);
    expect(usersRoute?.meta?.sla?.priority).toBe('high');

    const ordersRoute = annotated.find((r) => r.method === 'POST' && r.path === '/api/orders');
    expect(ordersRoute?.meta?.sla?.maxResponseTimeMs).toBe(400);

    const healthRoute = annotated.find((r) => r.path === '/api/health');
    expect(healthRoute?.meta?.sla).toBeUndefined();
  });

  it('should generate a markdown SLA report from annotated routes', () => {
    const app = buildSlaApp();
    setSlaAnnotation('GET', '/api/users', { maxResponseTimeMs: 200, priority: 'critical', sloPercentage: 99.99 });

    const routes = extractRoutes(app);
    const report = generateSlaReport(routes);

    expect(report).toContain('# SLA Report');
    expect(report).toContain('/api/users');
    expect(report).toContain('critical');
    expect(report).toContain('99.99%');
  });
});
