/**
 * routeEnvironmentAnnotator.ts
 * Annotate routes with the environments they are available in (e.g. production, staging, development).
 */

import { RouteInfo } from './types';

type Environment = 'production' | 'staging' | 'development' | string;

interface EnvironmentAnnotation {
  environments: Environment[];
}

const environmentRegistry = new Map<string, EnvironmentAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setEnvironmentAnnotation(
  method: string,
  path: string,
  environments: Environment[]
): void {
  environmentRegistry.set(routeKey(method, path), { environments });
}

export function getEnvironmentAnnotation(
  method: string,
  path: string
): EnvironmentAnnotation | undefined {
  return environmentRegistry.get(routeKey(method, path));
}

export function applyEnvironmentAnnotations(
  routes: RouteInfo[]
): (RouteInfo & { environments?: Environment[] })[] {
  return routes.map((route) => {
    const annotation = getEnvironmentAnnotation(route.method, route.path);
    if (!annotation) return route;
    return { ...route, environments: annotation.environments };
  });
}

export function filterByEnvironment(
  routes: (RouteInfo & { environments?: Environment[] })[],
  env: Environment
): (RouteInfo & { environments?: Environment[] })[] {
  return routes.filter(
    (route) => !route.environments || route.environments.includes(env)
  );
}

export function clearEnvironmentRegistry(): void {
  environmentRegistry.clear();
}

export function getEnvironmentSummary(
  routes: (RouteInfo & { environments?: Environment[] })[]
): Record<Environment, number> {
  const summary: Record<string, number> = {};
  for (const route of routes) {
    const envs = route.environments ?? ['all'];
    for (const env of envs) {
      summary[env] = (summary[env] ?? 0) + 1;
    }
  }
  return summary;
}
