import { RouteInfo } from './types';

export interface RouteDiff {
  added: RouteInfo[];
  removed: RouteInfo[];
  unchanged: RouteInfo[];
}

/**
 * Creates a unique key for a route based on method and path.
 */
export function routeKey(route: RouteInfo): string {
  return `${route.method.toUpperCase()}:${route.path}`;
}

/**
 * Compares two sets of routes and returns the diff.
 */
export function compareRoutes(
  previous: RouteInfo[],
  current: RouteInfo[]
): RouteDiff {
  const previousMap = new Map<string, RouteInfo>();
  const currentMap = new Map<string, RouteInfo>();

  for (const route of previous) {
    previousMap.set(routeKey(route), route);
  }

  for (const route of current) {
    currentMap.set(routeKey(route), route);
  }

  const added: RouteInfo[] = [];
  const removed: RouteInfo[] = [];
  const unchanged: RouteInfo[] = [];

  for (const [key, route] of currentMap) {
    if (!previousMap.has(key)) {
      added.push(route);
    } else {
      unchanged.push(route);
    }
  }

  for (const [key, route] of previousMap) {
    if (!currentMap.has(key)) {
      removed.push(route);
    }
  }

  return { added, removed, unchanged };
}

/**
 * Returns true if there are any differences between the two route sets.
 */
export function hasRouteChanges(
  previous: RouteInfo[],
  current: RouteInfo[]
): boolean {
  const diff = compareRoutes(previous, current);
  return diff.added.length > 0 || diff.removed.length > 0;
}

/**
 * Formats a RouteDiff into a human-readable summary string.
 */
export function formatDiffSummary(diff: RouteDiff): string {
  const lines: string[] = [];

  if (diff.added.length > 0) {
    lines.push(`Added (${diff.added.length}):`);
    for (const r of diff.added) {
      lines.push(`  + ${r.method.toUpperCase()} ${r.path}`);
    }
  }

  if (diff.removed.length > 0) {
    lines.push(`Removed (${diff.removed.length}):`);
    for (const r of diff.removed) {
      lines.push(`  - ${r.method.toUpperCase()} ${r.path}`);
    }
  }

  if (lines.length === 0) {
    return 'No route changes detected.';
  }

  return lines.join('\n');
}
