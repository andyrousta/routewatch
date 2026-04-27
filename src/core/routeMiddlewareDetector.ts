import { Router } from 'express';

export interface DetectedMiddleware {
  name: string;
  type: 'named' | 'anonymous';
}

export function extractMiddlewareNames(
  layer: Record<string, unknown>
): DetectedMiddleware[] {
  const middlewares: DetectedMiddleware[] = [];

  const handle = layer['handle'] as Record<string, unknown> | undefined;
  if (!handle) return middlewares;

  if (typeof handle === 'function') {
    const name = (handle as Function).name;
    middlewares.push({
      name: name && name !== '' ? name : 'anonymous',
      type: name && name !== '' ? 'named' : 'anonymous',
    });
  }

  return middlewares;
}

export function detectMiddlewareForRoute(
  router: Router,
  targetPath: string,
  targetMethod: string
): DetectedMiddleware[] {
  const stack = (router as unknown as { stack: Record<string, unknown>[] }).stack;
  if (!stack) return [];

  const detected: DetectedMiddleware[] = [];

  for (const layer of stack) {
    const route = layer['route'] as Record<string, unknown> | undefined;
    if (!route) continue;

    const routePath = route['path'] as string | undefined;
    const routeStack = route['stack'] as Record<string, unknown>[] | undefined;

    if (routePath !== targetPath || !routeStack) continue;

    for (const routeLayer of routeStack) {
      const method = routeLayer['method'] as string | undefined;
      if (method && method.toUpperCase() !== targetMethod.toUpperCase()) continue;
      detected.push(...extractMiddlewareNames(routeLayer));
    }
  }

  return detected;
}
