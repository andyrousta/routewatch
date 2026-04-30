import { RouteInfo } from './types';

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  name?: string;
  in?: 'header' | 'query' | 'cookie';
  scopes?: string[];
}

const securityRegistry = new Map<string, SecurityScheme[]>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setSecuritySchemes(method: string, path: string, schemes: SecurityScheme[]): void {
  securityRegistry.set(routeKey(method, path), schemes);
}

export function getSecuritySchemes(method: string, path: string): SecurityScheme[] | undefined {
  return securityRegistry.get(routeKey(method, path));
}

export function applySecurityAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const schemes = getSecuritySchemes(route.method, route.path);
    if (!schemes) return route;
    return {
      ...route,
      security: schemes,
    } as RouteInfo & { security: SecurityScheme[] };
  });
}

export function clearSecurityRegistry(): void {
  securityRegistry.clear();
}

export function getSecuritySummary(): Record<string, SecurityScheme[]> {
  const summary: Record<string, SecurityScheme[]> = {};
  securityRegistry.forEach((schemes, key) => {
    summary[key] = schemes;
  });
  return summary;
}
