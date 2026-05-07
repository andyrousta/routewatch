import express from 'express';
import { extractRoutes } from './routeExtractor';
import {
  setAliasAnnotation,
  applyAliasAnnotations,
  clearAliasRegistry,
} from './routeAliasAnnotator';

function buildAliasedApp() {
  const app = express();
  app.get('/users', (_req, res) => res.json([]));
  app.post('/users', (_req, res) => res.status(201).json({}));
  app.get('/posts', (_req, res) => res.json([]));
  return app;
}

beforeEach(() => {
  clearAliasRegistry();
});

describe('routeAliasAnnotator integration', () => {
  it('should annotate extracted routes with configured aliases', () => {
    setAliasAnnotation('GET', '/users', ['/members', '/people']);
    setAliasAnnotation('GET', '/posts', ['/articles']);

    const app = buildAliasedApp();
    const routes = extractRoutes(app);
    const annotated = applyAliasAnnotations(routes);

    const usersGet = annotated.find((r) => r.method === 'GET' && r.path === '/users');
    const postsGet = annotated.find((r) => r.method === 'GET' && r.path === '/posts');
    const usersPost = annotated.find((r) => r.method === 'POST' && r.path === '/users');

    expect((usersGet as any)?.aliases).toEqual(['/members', '/people']);
    expect((postsGet as any)?.aliases).toEqual(['/articles']);
    expect((usersPost as any)?.aliases).toBeUndefined();
  });

  it('should return routes unchanged when no aliases are configured', () => {
    const app = buildAliasedApp();
    const routes = extractRoutes(app);
    const annotated = applyAliasAnnotations(routes);

    annotated.forEach((route) => {
      expect(route).not.toHaveProperty('aliases');
    });
  });
});
