import express from 'express';
import { routewatch, stopRoutewatch } from './middlewareFactory';
import { extractRoutes } from './routeExtractor';
import {
  setOwnerAnnotation,
  applyOwnerAnnotations,
  clearOwnerRegistry,
} from './routeOwnerAnnotator';

function buildOwnedApp() {
  const app = express();
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/users', (_req, res) => res.status(201).json({}));
  app.delete('/api/users/:id', (_req, res) => res.status(204).send());
  return app;
}

beforeEach(() => {
  clearOwnerRegistry();
});

afterEach(() => {
  stopRoutewatch();
});

describe('routeOwnerAnnotator integration', () => {
  it('annotates extracted routes with owner metadata', () => {
    const app = buildOwnedApp();
    setOwnerAnnotation('GET', '/api/users', { team: 'identity', contact: 'id@example.com' });
    setOwnerAnnotation('POST', '/api/users', { team: 'identity' });

    const routes = extractRoutes(app);
    const annotated = applyOwnerAnnotations(routes);

    const getUsers = annotated.find((r) => r.method === 'GET' && r.path === '/api/users');
    const postUsers = annotated.find((r) => r.method === 'POST' && r.path === '/api/users');
    const deleteUsers = annotated.find((r) => r.method === 'DELETE');

    expect((getUsers as any)?.metadata?.owner?.team).toBe('identity');
    expect((getUsers as any)?.metadata?.owner?.contact).toBe('id@example.com');
    expect((postUsers as any)?.metadata?.owner?.team).toBe('identity');
    expect((deleteUsers as any)?.metadata?.owner).toBeUndefined();
  });

  it('does not mutate original route objects', () => {
    const app = buildOwnedApp();
    setOwnerAnnotation('GET', '/api/users', { team: 'platform' });

    const routes = extractRoutes(app);
    const original = routes.find((r) => r.method === 'GET' && r.path === '/api/users')!;
    applyOwnerAnnotations(routes);

    expect((original as any).metadata).toBeUndefined();
  });
});
