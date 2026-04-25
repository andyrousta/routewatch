import { RouteInfo } from './types';

export interface HealthCheckResult {
  status: 'healthy' | 'warnings' | 'errors';
  totalRoutes: number;
  duplicates: string[];
  missingMethods: string[];
  invalidPaths: string[];
  summary: string;
}

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const VALID_PATH_REGEX = /^(\/[a-zA-Z0-9_\-:.*()]*)+\/?$|^\/$/;

export function findDuplicateRoutes(routes: RouteInfo[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const route of routes) {
    const key = `${route.method.toUpperCase()}:${route.path}`;
    if (seen.has(key)) {
      duplicates.push(key);
    } else {
      seen.add(key);
    }
  }
  return duplicates;
}

export function findMissingMethods(routes: RouteInfo[]): string[] {
  return routes
    .filter((r) => !VALID_METHODS.includes(r.method.toUpperCase()))
    .map((r) => `${r.method}:${r.path}`);
}

export function findInvalidPaths(routes: RouteInfo[]): string[] {
  return routes
    .filter((r) => !VALID_PATH_REGEX.test(r.path))
    .map((r) => r.path);
}

/**
 * Returns a deduplicated list of routes by method+path key.
 * When duplicates exist, only the first occurrence is kept.
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

export function runHealthCheck(routes: RouteInfo[]): HealthCheckResult {
  const duplicates = findDuplicateRoutes(routes);
  const missingMethods = findMissingMethods(routes);
  const invalidPaths = findInvalidPaths(routes);

  const hasErrors = missingMethods.length > 0 || invalidPaths.length > 0;
  const hasWarnings = duplicates.length > 0;

  const status = hasErrors ? 'errors' : hasWarnings ? 'warnings' : 'healthy';

  const parts: string[] = [`${routes.length} route(s) checked`];
  if (duplicates.length) parts.push(`${duplicates.length} duplicate(s)`);
  if (missingMethods.length) parts.push(`${missingMethods.length} invalid method(s)`);
  if (invalidPaths.length) parts.push(`${invalidPaths.length} invalid path(s)`);

  return {
    status,
    totalRoutes: routes.length,
    duplicates,
    missingMethods,
    invalidPaths,
    summary: parts.join(', '),
  };
}
