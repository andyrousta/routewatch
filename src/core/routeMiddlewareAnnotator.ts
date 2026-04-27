import { RouteInfo } from './types';

type MiddlewareName = string;

interface MiddlewareAnnotation {
  middlewares: MiddlewareName[];
}

const middlewareRegistry = new Map<string, MiddlewareAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setMiddlewareAnnotation(
  method: string,
  path: string,
  middlewares: MiddlewareName[]
): void {
  const key = routeKey(method, path);
  middlewareRegistry.set(key, { middlewares });
}

export function getMiddlewareAnnotation(
  method: string,
  path: string
): MiddlewareAnnotation | undefined {
  return middlewareRegistry.get(routeKey(method, path));
}

export function applyMiddlewareAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotation = getMiddlewareAnnotation(route.method, route.path);
    if (!annotation) return route;
    return {
      ...route,
      metadata: {
        ...(route.metadata ?? {}),
        middlewares: annotation.middlewares,
      },
    };
  });
}

export function clearMiddlewareRegistry(): void {
  middlewareRegistry.clear();
}

export function getMiddlewareSummary(): Record<string, MiddlewareName[]> {
  const summary: Record<string, MiddlewareName[]> = {};
  middlewareRegistry.forEach((value, key) => {
    summary[key] = value.middlewares;
  });
  return summary;
}
