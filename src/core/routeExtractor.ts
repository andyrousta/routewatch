import { Express } from 'express';

export interface RouteInfo {
  method: string;
  path: string;
  middlewares: string[];
}

/**
 * Extracts all registered routes from an Express application instance.
 */
export function extractRoutes(app: Express): RouteInfo[] {
  const routes: RouteInfo[] = [];

  const stack = (app as any)._router?.stack;
  if (!stack) {
    return routes;
  }

  function processStack(stackItems: any[], prefix = '') {
    for (const layer of stackItems) {
      if (layer.route) {
        const routePath = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods).filter(
          (m) => layer.route.methods[m]
        );

        for (const method of methods) {
          const middlewares = (layer.route.stack || [])
            .map((l: any) => l.handle?.name || 'anonymous')
            .filter((name: string) => name !== '<anonymous>');

          routes.push({
            method: method.toUpperCase(),
            path: routePath,
            middlewares,
          });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const routerPrefix = prefix + (layer.regexp?.source
          ? extractPrefixFromRegex(layer.regexp)
          : '');
        processStack(layer.handle.stack, routerPrefix);
      }
    }
  }

  processStack(stack);
  return routes;
}

function extractPrefixFromRegex(regexp: RegExp): string {
  const match = regexp.source.match(/^\.\^\\(\/[^\\]+)/);
  return match ? match[1] : '';
}
