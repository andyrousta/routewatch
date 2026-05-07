import express from 'express';
import {
  setVisibilityAnnotation,
  applyVisibilityAnnotations,
  filterByVisibility,
  clearVisibilityRegistry,
} from './routeVisibilityAnnotator';
import { extractRoutes } from './routeExtractor';

function buildVisibilityApp() {
  const app = express();
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/users', (_req, res) => res.sendStatus(201));
  app.get('/api/admin/stats', (_req, res) => res.json({}));
  app.delete('/api/admin/user/:id', (_req, res) => res.sendStatus(204));
  return app;
}

beforeEach(() => {
  clearVisibilityRegistry();
});

describe('routeVisibilityAnnotator integration', () => {
  it('annotates and filters routes extracted from an Express app', () => {
    const app = buildVisibilityApp();
    const routes = extractRoutes(app);

    setVisibilityAnnotation('GET', '/api/admin/stats', { level: 'internal', reason: 'metrics' });
    setVisibilityAnnotation('DELETE', '/api/admin/user/:id', { level: 'private' });

    const annotated = applyVisibilityAnnotations(routes);
    const publicAndInternal = filterByVisibility(annotated, ['public', 'internal']);

    const paths = publicAndInternal.map((r) => r.path);
    expect(paths).toContain('/api/users');
    expect(paths).toContain('/api/admin/stats');
    expect(paths).not.toContain('/api/admin/user/:id');
  });

  it('returns all routes when all visibility levels are included', () => {
    const app = buildVisibilityApp();
    const routes = extractRoutes(app);

    setVisibilityAnnotation('DELETE', '/api/admin/user/:id', { level: 'private' });

    const annotated = applyVisibilityAnnotations(routes);
    const all = filterByVisibility(annotated, ['public', 'internal', 'private']);

    expect(all.length).toBe(routes.length);
  });

  it('defaults unannotated routes to public visibility', () => {
    const app = buildVisibilityApp();
    const routes = extractRoutes(app);
    const annotated = applyVisibilityAnnotations(routes);
    const publicOnly = filterByVisibility(annotated, ['public']);

    // All routes unannotated → all treated as public
    expect(publicOnly.length).toBe(routes.length);
  });
});
