import { RouteInfo } from './types';

export interface FilterOptions {
  methods?: string[];
  pathPrefix?: string;
  excludePaths?: string[];
  tags?: string[];
}

/**
 * Filters routes based on provided options.
 */
export function filterRoutes(routes: RouteInfo[], options: FilterOptions): RouteInfo[] {
  let filtered = [...routes];

  if (options.methods && options.methods.length > 0) {
    const normalizedMethods = options.methods.map((m) => m.toUpperCase());
    filtered = filtered.filter((route) =>
      normalizedMethods.includes(route.method.toUpperCase())
    );
  }

  if (options.pathPrefix) {
    filtered = filtered.filter((route) =>
      route.path.startsWith(options.pathPrefix!)
    );
  }

  if (options.excludePaths && options.excludePaths.length > 0) {
    filtered = filtered.filter(
      (route) =>
        !options.excludePaths!.some((excluded) => route.path.startsWith(excluded))
    );
  }

  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(
      (route) =>
        route.tags && options.tags!.some((tag) => route.tags!.includes(tag))
    );
  }

  return filtered;
}

/**
 * Groups routes by their first path segment (e.g., /users/... -> 'users').
 */
export function groupRoutesByPrefix(routes: RouteInfo[]): Record<string, RouteInfo[]> {
  return routes.reduce<Record<string, RouteInfo[]>>((acc, route) => {
    const segments = route.path.split('/').filter(Boolean);
    const prefix = segments[0] ?? 'root';
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(route);
    return acc;
  }, {});
}

/**
 * Deduplicates routes by method + path combination.
 */
export function deduplicateRoutes(routes: RouteInfo[]): RouteInfo[] {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const key = `${route.method.toUpperCase()}:${route.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
