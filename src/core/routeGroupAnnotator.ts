import { RouteInfo } from './types';

type GroupRegistry = Map<string, string>;

const groupRegistry: GroupRegistry = new Map();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setGroupAnnotation(method: string, path: string, group: string): void {
  groupRegistry.set(routeKey(method, path), group);
}

export function getGroupAnnotation(method: string, path: string): string | undefined {
  return groupRegistry.get(routeKey(method, path));
}

export function applyGroupAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const group = groupRegistry.get(routeKey(route.method, route.path));
    if (group !== undefined) {
      return { ...route, group };
    }
    return route;
  });
}

export function clearGroupRegistry(): void {
  groupRegistry.clear();
}

export function groupRoutesByAnnotation(routes: RouteInfo[]): Record<string, RouteInfo[]> {
  const annotated = applyGroupAnnotations(routes);
  const result: Record<string, RouteInfo[]> = {};

  for (const route of annotated) {
    const key = (route as RouteInfo & { group?: string }).group ?? 'default';
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(route);
  }

  return result;
}
