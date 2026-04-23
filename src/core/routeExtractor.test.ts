import express from 'express';
import { extractRoutes, RouteInfo } from './routeExtractor';

describe('extractRoutes', () => {
  it('should return an empty array if no routes are registered', () => {
    const app = express();
    const routes = extractRoutes(app);
    expect(routes).toEqual([]);
  });

  it('should extract a single GET route', () => {
    const app = express();
    app.get('/health', (_req, res) => res.send('ok'));

    const routes = extractRoutes(app);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatchObject<Partial<RouteInfo>>({
      method: 'GET',
      path: '/health',
    });
  });

  it('should extract multiple routes with different methods', () => {
    const app = express();
    app.get('/users', (_req, res) => res.json([]));
    app.post('/users', (_req, res) => res.status(201).json({}));
    app.delete('/users/:id', (_req, res) => res.status(204).send());

    const routes = extractRoutes(app);
    expect(routes).toHaveLength(3);

    const methods = routes.map((r) => r.method);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('DELETE');
  });

  it('should capture named middleware functions', () => {
    const app = express();
    function authMiddleware(_req: any, _res: any, next: any) { next(); }
    app.get('/protected', authMiddleware, (_req, res) => res.send('secret'));

    const routes = extractRoutes(app);
    expect(routes[0].middlewares).toContain('authMiddleware');
  });

  it('should extract routes from a sub-router', () => {
    const app = express();
    const router = express.Router();
    router.get('/profile', (_req, res) => res.json({}));
    app.use('/api', router);

    const routes = extractRoutes(app);
    expect(routes.some((r) => r.path.includes('/profile'))).toBe(true);
  });
});
