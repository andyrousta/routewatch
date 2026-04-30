import express from 'express';
import { routewatch } from './middlewareFactory';
import {
  setSecuritySchemes,
  applySecurityAnnotations,
  clearSecurityRegistry,
} from './routeSecurityAnnotator';
import { extractRoutes } from './routeExtractor';

function buildSecuredApp() {
  const app = express();
  app.get('/api/v1/users', (_req, res) => res.json([]));
  app.post('/api/v1/users', (_req, res) => res.status(201).json({}));
  app.get('/api/v1/public/status', (_req, res) => res.json({ ok: true }));
  return app;
}

beforeEach(() => {
  clearSecurityRegistry();
});

describe('routeSecurityAnnotator integration', () => {
  it('annotates extracted routes from a real Express app', () => {
    const app = buildSecuredApp();
    const routes = extractRoutes(app);

    setSecuritySchemes('GET', '/api/v1/users', [
      { type: 'http', scheme: 'bearer' },
    ]);
    setSecuritySchemes('POST', '/api/v1/users', [
      { type: 'http', scheme: 'bearer' },
      { type: 'apiKey', name: 'X-API-Key', in: 'header' },
    ]);

    const annotated = applySecurityAnnotations(routes);

    const getUsers = annotated.find(
      (r) => r.method === 'GET' && r.path === '/api/v1/users'
    );
    const postUsers = annotated.find(
      (r) => r.method === 'POST' && r.path === '/api/v1/users'
    );
    const publicStatus = annotated.find(
      (r) => r.path === '/api/v1/public/status'
    );

    expect((getUsers as any)?.security).toEqual([{ type: 'http', scheme: 'bearer' }]);
    expect((postUsers as any)?.security).toHaveLength(2);
    expect((publicStatus as any)?.security).toBeUndefined();
  });

  it('does not mutate the original route objects', () => {
    const app = buildSecuredApp();
    const routes = extractRoutes(app);
    const original = routes.map((r) => ({ ...r }));

    setSecuritySchemes('GET', '/api/v1/users', [{ type: 'http', scheme: 'bearer' }]);
    applySecurityAnnotations(routes);

    routes.forEach((route, i) => {
      expect(route).toEqual(original[i]);
    });
  });
});
