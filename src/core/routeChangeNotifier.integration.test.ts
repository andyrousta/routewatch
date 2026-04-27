import express from 'express';
import { extractRoutes } from './routeExtractor';
import { compareRoutes } from './routeComparator';
import {
  configureNotifier,
  notifyRouteChanges,
  resetNotifier,
} from './routeChangeNotifier';
import { RouteInfo } from './types';

function buildAppV1(): express.Express {
  const app = express();
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/users', (_req, res) => res.status(201).json({}));
  app.get('/api/posts', (_req, res) => res.json([]));
  return app;
}

function buildAppV2(): express.Express {
  const app = express();
  app.get('/api/users', (_req, res) => res.json([]));
  app.post('/api/users', (_req, res) => res.status(201).json({}));
  app.get('/api/articles', (_req, res) => res.json([]));
  app.delete('/api/posts/:id', (_req, res) => res.status(204).send());
  return app;
}

describe('routeChangeNotifier integration', () => {
  beforeEach(() => resetNotifier());

  it('detects and notifies about route changes between two app versions', async () => {
    const received: { summary: string; added: RouteInfo[]; removed: RouteInfo[] }[] = [];

    configureNotifier({
      channel: 'callback',
      onNotify: (summary, added, removed) => {
        received.push({ summary, added, removed });
      },
    });

    const v1Routes = extractRoutes(buildAppV1());
    const v2Routes = extractRoutes(buildAppV2());
    const diff = compareRoutes(v1Routes, v2Routes);

    await notifyRouteChanges(diff.added, diff.removed);

    expect(received).toHaveLength(1);
    const { added, removed, summary } = received[0];

    const addedPaths = added.map((r) => r.path);
    const removedPaths = removed.map((r) => r.path);

    expect(addedPaths).toContain('/api/articles');
    expect(addedPaths).toContain('/api/posts/:id');
    expect(removedPaths).toContain('/api/posts');

    expect(summary).toMatch(/added|removed/i);
  });

  it('does not notify when routes are identical', async () => {
    const onNotify = jest.fn();
    configureNotifier({ channel: 'callback', onNotify });

    const v1Routes = extractRoutes(buildAppV1());
    const diff = compareRoutes(v1Routes, v1Routes);

    await notifyRouteChanges(diff.added, diff.removed);
    expect(onNotify).not.toHaveBeenCalled();
  });
});
