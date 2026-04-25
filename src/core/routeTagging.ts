import { RouteInfo } from './types';

type TagMap = Record<string, string[]>;

let tagRegistry: TagMap = {};

/**
 * Set tags for a given route key (method:path).
 */
export function setTagsForRoute(method: string, path: string, tags: string[]): void {
  const key = buildKey(method, path);
  tagRegistry[key] = [...new Set(tags)];
}

/**
 * Get tags for a given route key.
 */
export function getTagsForRoute(method: string, path: string): string[] {
  const key = buildKey(method, path);
  return tagRegistry[key] ?? [];
}

/**
 * Apply registered tags to an array of RouteInfo objects.
 */
export function applyTags(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => ({
    ...route,
    tags: getTagsForRoute(route.method, route.path),
  }));
}

/**
 * Group routes by a specific tag.
 */
export function groupRoutesByTag(routes: RouteInfo[]): Record<string, RouteInfo[]> {
  const groups: Record<string, RouteInfo[]> = {};

  for (const route of routes) {
    const tags = route.tags ?? [];
    if (tags.length === 0) {
      const untagged = groups['untagged'] ?? [];
      groups['untagged'] = [...untagged, route];
    } else {
      for (const tag of tags) {
        const existing = groups[tag] ?? [];
        groups[tag] = [...existing, route];
      }
    }
  }

  return groups;
}

/**
 * Clear all registered tags (useful for testing).
 */
export function clearTagRegistry(): void {
  tagRegistry = {};
}

function buildKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}
