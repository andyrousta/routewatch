import { RouteInfo } from './types';

export type StabilityLevel = 'experimental' | 'beta' | 'stable' | 'deprecated';

export interface StabilityAnnotation {
  level: StabilityLevel;
  since?: string;
  note?: string;
}

const stabilityRegistry = new Map<string, StabilityAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setStabilityAnnotation(
  method: string,
  path: string,
  annotation: StabilityAnnotation
): void {
  stabilityRegistry.set(routeKey(method, path), annotation);
}

export function getStabilityAnnotation(
  method: string,
  path: string
): StabilityAnnotation | undefined {
  return stabilityRegistry.get(routeKey(method, path));
}

export function applyStabilityAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotation = getStabilityAnnotation(route.method, route.path);
    if (!annotation) return route;
    return {
      ...route,
      stability: annotation.level,
      stabilitySince: annotation.since,
      stabilityNote: annotation.note,
    } as RouteInfo & Record<string, unknown>;
  });
}

export function clearStabilityRegistry(): void {
  stabilityRegistry.clear();
}

export function getStabilitySummary(
  routes: RouteInfo[]
): Record<StabilityLevel, number> {
  const annotated = applyStabilityAnnotations(routes);
  const summary: Record<StabilityLevel, number> = {
    experimental: 0,
    beta: 0,
    stable: 0,
    deprecated: 0,
  };
  for (const route of annotated) {
    const level = (route as Record<string, unknown>).stability as
      | StabilityLevel
      | undefined;
    if (level && level in summary) {
      summary[level]++;
    }
  }
  return summary;
}
