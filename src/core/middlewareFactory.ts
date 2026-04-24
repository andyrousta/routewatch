import { Request, Response, NextFunction } from 'express';
import { extractRoutes } from './routeExtractor';
import { generateDoc, generateMarkdown } from './docGenerator';
import { writeIfChanged } from './outputWriter';
import { startWatcher, stopWatcher } from './syncWatcher';

export interface RouteWatchOptions {
  outputPath?: string;
  format?: 'json' | 'markdown';
  watch?: boolean;
  docsRoute?: string;
  title?: string;
  version?: string;
}

const DEFAULT_OPTIONS: Required<RouteWatchOptions> = {
  outputPath: './docs/api',
  format: 'markdown',
  watch: process.env.NODE_ENV !== 'production',
  docsRoute: '/_routewatch',
  title: 'API Documentation',
  version: '1.0.0',
};

export function routewatch(app: any, userOptions: RouteWatchOptions = {}) {
  const options: Required<RouteWatchOptions> = { ...DEFAULT_OPTIONS, ...userOptions };

  const generateAndWrite = async () => {
    const routes = extractRoutes(app);
    const doc = generateDoc(routes, { title: options.title, version: options.version });
    const content =
      options.format === 'markdown' ? generateMarkdown(doc) : JSON.stringify(doc, null, 2);
    const ext = options.format === 'markdown' ? 'md' : 'json';
    await writeIfChanged(`${options.outputPath}/routes.${ext}`, content);
    return { routes, doc, content };
  };

  if (options.watch) {
    startWatcher(options.outputPath, generateAndWrite);
  }

  generateAndWrite().catch((err) => {
    console.error('[routewatch] Failed to generate initial documentation:', err);
  });

  return function routewatchMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path === options.docsRoute) {
      generateAndWrite()
        .then(({ doc, content }) => {
          if (options.format === 'json') {
            res.json(doc);
          } else {
            res.type('text/markdown').send(content);
          }
        })
        .catch((err) => {
          res.status(500).json({ error: 'Failed to generate documentation', details: err.message });
        });
      return;
    }
    next();
  };
}

export function stopRoutewatch() {
  stopWatcher();
}
