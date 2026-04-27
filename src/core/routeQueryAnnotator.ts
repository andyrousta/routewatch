import { RouteInfo } from './types';

export interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

type RouteKey = string;
const queryRegistry = new Map<RouteKey, QueryParam[]>();

export function routeKey(method: string, path: string): RouteKey {
  return `${method.toUpperCase()}:${path}`;
}

export function setQueryParams(method: string, path: string, params: QueryParam[]): void {
  queryRegistry.set(routeKey(method, path), params);
}

export function getQueryParams(method: string, path: string): QueryParam[] | undefined {
  return queryRegistry.get(routeKey(method, path));
}

export function applyQueryAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const params = queryRegistry.get(routeKey(route.method, route.path));
    if (!params) return route;
    return {
      ...route,
      meta: {
        ...(route.meta ?? {}),
        queryParams: params,
      },
    };
  });
}

export function clearQueryRegistry(): void {
  queryRegistry.clear();
}

export function getQuerySummary(): Record<string, QueryParam[]> {
  const summary: Record<string, QueryParam[]> = {};
  for (const [key, params] of queryRegistry.entries()) {
    summary[key] = params;
  }
  return summary;
}
