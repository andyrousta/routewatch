import express from 'express';
import { extractRoutes } from './routeExtractor';
import {
  setGroupAnnotation,
  clearGroupRegistry,
  groupRoutesByAnnotation,
} from './routeGroupAnnotator';

function buildGroupedApp() {
  const app = express();

  const userRouter = express.Router();
  userRouter.get('/', (_req, res) => res.json([]));
  userRouter.post('/', (_req, res) => res.json({}));
  userRouter.delete('/:id', (_req, res) => res.sendStatus(204));

  const productRouter = express.Router();
  productRouter.get('/', (_req, res) => res.json([]));
  productRouter.get('/:id', (_req, res) => res.json({}));

  app.use('/users', userRouter);
  app.use('/products', productRouter);

  return app;
}

beforeEach(() => {
  clearGroupRegistry();
});

describe('routeGroupAnnotator integration', () => {
  it('groups extracted routes by annotation', () => {
    const app = buildGroupedApp();
    const routes = extractRoutes(app);

    setGroupAnnotation('GET', '/users', 'Users');
    setGroupAnnotation('POST', '/users', 'Users');
    setGroupAnnotation('DELETE', '/users/:id', 'Users');
    setGroupAnnotation('GET', '/products', 'Products');
    setGroupAnnotation('GET', '/products/:id', 'Products');

    const groups = groupRoutesByAnnotation(routes);

    expect(groups['Users']).toBeDefined();
    expect(groups['Products']).toBeDefined();
    expect(groups['Users'].length).toBeGreaterThanOrEqual(1);
    expect(groups['Products'].length).toBeGreaterThanOrEqual(1);
  });

  it('puts unregistered routes in default group', () => {
    const app = buildGroupedApp();
    const routes = extractRoutes(app);
    const groups = groupRoutesByAnnotation(routes);
    expect(groups['default']).toBeDefined();
    expect(groups['default'].length).toBe(routes.length);
  });
});
