import { RouteInfo } from './types';

export interface VersionedRoute extends RouteInfo {
  version: string;
  deprecated?: boolean;
  deprecatedSince?: string;
  replacedBy?: string;
}

export interface VersionMap {
  [version: string]: RouteInfo[];
}

const VERSION_PATTERN = /\/v(\d+)(?:\/|$)/;

export function extractVersionFromPath(path: string): string | null {
  const match = path.match(VERSION_PATTERN);
  return match ? `v${match[1]}` : null;
}

export function groupRoutesByVersion(routes: RouteInfo[]): VersionMap {
  const map: VersionMap = {};

  for (const route of routes) {
    const version = extractVersionFromPath(route.path) ?? 'unversioned';
    if (!map[version]) {
      map[version] = [];
    }
    map[version].push(route);
  }

  return map;
}

export function annotateVersions(routes: RouteInfo[]): VersionedRoute[] {
  return routes.map((route) => ({
    ...route,
    version: extractVersionFromPath(route.path) ?? 'unversioned',
  }));
}

export function getLatestVersion(routes: RouteInfo[]): string | null {
  const versions = routes
    .map((r) => extractVersionFromPath(r.path))
    .filter((v): v is string => v !== null)
    .map((v) => parseInt(v.replace('v', ''), 10))
    .sort((a, b) => b - a);

  return versions.length > 0 ? `v${versions[0]}` : null;
}

export function filterByVersion(routes: RouteInfo[], version: string): RouteInfo[] {
  return routes.filter((r) => extractVersionFromPath(r.path) === version);
}
