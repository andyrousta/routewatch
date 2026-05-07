/**
 * routeVisibilityAnnotator.ts
 * Allows marking routes as public, internal, or private for documentation filtering.
 */

import { RouteInfo } from './types';

export type VisibilityLevel = 'public' | 'internal' | 'private';

export interface VisibilityAnnotation {
  level: VisibilityLevel;
  reason?: string;
}

const visibilityRegistry = new Map<string, VisibilityAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setVisibilityAnnotation(
  method: string,
  path: string,
  annotation: VisibilityAnnotation
): void {
  visibilityRegistry.set(routeKey(method, path), annotation);
}

export function getVisibilityAnnotation(
  method: string,
  path: string
): VisibilityAnnotation | undefined {
  return visibilityRegistry.get(routeKey(method, path));
}

export function applyVisibilityAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotation = getVisibilityAnnotation(route.method, route.path);
    if (!annotation) return route;
    return {
      ...route,
      visibility: annotation.level,
      visibilityReason: annotation.reason,
    };
  });
}

export function filterByVisibility(
  routes: RouteInfo[],
  levels: VisibilityLevel[]
): RouteInfo[] {
  return routes.filter((route) => {
    const level = (route as any).visibility as VisibilityLevel | undefined;
    // Default to 'public' if not annotated
    return levels.includes(level ?? 'public');
  });
}

export function clearVisibilityRegistry(): void {
  visibilityRegistry.clear();
}

export function getVisibilitySummary(
  routes: RouteInfo[]
): Record<VisibilityLevel, number> {
  const summary: Record<VisibilityLevel, number> = {
    public: 0,
    internal: 0,
    private: 0,
  };
  for (const route of routes) {
    const level = (route as any).visibility as VisibilityLevel | undefined;
    summary[level ?? 'public'] += 1;
  }
  return summary;
}
