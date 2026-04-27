import express from 'express';
import {
  setMiddlewareAnnotation,
  applyMiddlewareAnnotations,
  clearMiddlewareRegistry,
} from './routeMiddlewareAnnotator';
import { detectMiddlewareForRoute } from './routeMiddlewareDetector';
import { RouteInfo } from './types';

function authMiddleware(req: unknown, res: unknown, next: Function) {
  next();
}

function rateLimiter(req: unknown, res: unknown, next: Function) {
  next();
}

beforeEach(() => {
  clearMiddlewareRegistry();
});

describe('middleware detection + annotation integration', () => {
  it('should detect and annotate middleware from an Express router', () => {
    const router = express.Router();
    router.get('/secure', authMiddleware, rateLimiter, (req, res) => res.send('ok'));

    const detected = detectMiddlewareForRoute(router, '/secure', 'GET');
    const names = detected.map((m) => m.name);

    setMiddlewareAnnotation('GET', '/secure', names);

    const routes: RouteInfo[] = [{ method: 'GET', path: '/secure', params: [] }];
    const annotated = applyMiddlewareAnnotations(routes);

    expect(annotated[0].metadata?.middlewares).toContain('authMiddleware');
    expect(annotated[0].metadata?.middlewares).toContain('rateLimiter');
  });

  it('should not annotate routes with no detected middleware', () => {
    const router = express.Router();
    router.get('/open', (req, res) => res.send('ok'));

    const detected = detectMiddlewareForRoute(router, '/open', 'GET');
    // Only anonymous handler, no explicit middleware to register
    const namedOnly = detected.filter((m) => m.type === 'named');
    if (namedOnly.length > 0) {
      setMiddlewareAnnotation('GET', '/open', namedOnly.map((m) => m.name));
    }

    const routes: RouteInfo[] = [{ method: 'GET', path: '/open', params: [] }];
    const annotated = applyMiddlewareAnnotations(routes);

    expect(annotated[0].metadata?.middlewares ?? []).toEqual([]);
  });
});
