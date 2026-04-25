import { RouteInfo } from './types';

export interface DeprecationMeta {
  deprecated: boolean;
  deprecatedSince?: string;
  replacedBy?: string;
  removalDate?: string;
}

export type DeprecationMap = Record<string, DeprecationMeta>;

let deprecationMap: DeprecationMap = {};

export function setDeprecationMap(map: DeprecationMap): void {
  deprecationMap = { ...map };
}

export function getDeprecationMap(): DeprecationMap {
  return { ...deprecationMap };
}

export function markDeprecated(
  method: string,
  path: string,
  meta: Omit<DeprecationMeta, 'deprecated'>
): void {
  const key = `${method.toUpperCase()}:${path}`;
  deprecationMap[key] = { deprecated: true, ...meta };
}

export function isDeprecated(method: string, path: string): boolean {
  const key = `${method.toUpperCase()}:${path}`;
  return deprecationMap[key]?.deprecated === true;
}

export function applyDeprecations(routes: RouteInfo[]): (RouteInfo & DeprecationMeta)[] {
  return routes.map((route) => {
    const key = `${route.method.toUpperCase()}:${route.path}`;
    const meta = deprecationMap[key];
    if (meta) {
      return { ...route, ...meta };
    }
    return { ...route, deprecated: false };
  });
}

export function getDeprecatedRoutes(routes: RouteInfo[]): RouteInfo[] {
  return routes.filter((route) => isDeprecated(route.method, route.path));
}

export function clearDeprecations(): void {
  deprecationMap = {};
}
