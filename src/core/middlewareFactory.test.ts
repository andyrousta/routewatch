import express, { Express } from 'express';
import request from 'supertest';
import { routewatch, stopRoutewatch } from './middlewareFactory';
import * as outputWriter from './outputWriter';
import * as syncWatcher from './syncWatcher';

jest.mock('./outputWriter');
jest.mock('./syncWatcher');

const mockWriteIfChanged = outputWriter.writeIfChanged as jest.Mock;
const mockStartWatcher = syncWatcher.startWatcher as jest.Mock;
const mockStopWatcher = syncWatcher.stopWatcher as jest.Mock;

function buildApp(): Express {
  const app = express();
  app.get('/users', (_req, res) => res.json([]));
  app.post('/users', (_req, res) => res.status(201).json({}));
  app.get('/users/:id', (_req, res) => res.json({}));
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockWriteIfChanged.mockResolvedValue(undefined);
});

afterEach(() => {
  stopRoutewatch();
});

describe('routewatch middleware factory', () => {
  it('should return a middleware function', () => {
    const app = buildApp();
    const middleware = routewatch(app, { watch: false });
    expect(typeof middleware).toBe('function');
  });

  it('should call writeIfChanged on initialization', async () => {
    const app = buildApp();
    routewatch(app, { watch: false });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockWriteIfChanged).toHaveBeenCalled();
  });

  it('should start watcher when watch is true', () => {
    const app = buildApp();
    routewatch(app, { watch: true });
    expect(mockStartWatcher).toHaveBeenCalled();
  });

  it('should NOT start watcher when watch is false', () => {
    const app = buildApp();
    routewatch(app, { watch: false });
    expect(mockStartWatcher).not.toHaveBeenCalled();
  });

  it('should serve JSON docs on docsRoute when format is json', async () => {
    const app = buildApp();
    const middleware = routewatch(app, { watch: false, format: 'json', docsRoute: '/_docs' });
    app.use(middleware);
    const res = await request(app).get('/_docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('routes');
  });

  it('should pass through non-docs requests', async () => {
    const app = buildApp();
    const middleware = routewatch(app, { watch: false });
    app.use(middleware);
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
  });
});
