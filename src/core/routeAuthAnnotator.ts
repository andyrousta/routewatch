import { RouteInfo } from './types';

export type AuthScheme = 'bearer' | 'basic' | 'apiKey' | 'oauth2' | 'none';

export interface AuthAnnotation {
  scheme: AuthScheme;
  scopes?: string[];
  description?: string;
}

const authRegistry = new Map<string, AuthAnnotation>();

function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setAuthAnnotation(
  method: string,
  path: string,
  annotation: AuthAnnotation
): void {
  authRegistry.set(routeKey(method, path), annotation);
}

export function getAuthAnnotation(
  method: string,
  path: string
): AuthAnnotation | undefined {
  return authRegistry.get(routeKey(method, path));
}

export function applyAuthAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotation = getAuthAnnotation(route.method, route.path);
    if (!annotation) return route;
    return {
      ...route,
      metadata: {
        ...(route.metadata ?? {}),
        auth: annotation,
      },
    };
  });
}

export function clearAuthRegistry(): void {
  authRegistry.clear();
}

export function getAuthSummary(
  routes: RouteInfo[]
): Record<AuthScheme, string[]> {
  const summary: Record<AuthScheme, string[]> = {
    bearer: [],
    basic: [],
    apiKey: [],
    oauth2: [],
    none: [],
  };

  for (const route of routes) {
    const annotation = getAuthAnnotation(route.method, route.path);
    const scheme: AuthScheme = annotation?.scheme ?? 'none';
    summary[scheme].push(`${route.method.toUpperCase()} ${route.path}`);
  }

  return summary;
}
