import { RouteInfo } from './types';

export interface SlaAnnotation {
  maxResponseTimeMs: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sloPercentage?: number;
}

const slaRegistry = new Map<string, SlaAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setSlaAnnotation(method: string, path: string, sla: SlaAnnotation): void {
  slaRegistry.set(routeKey(method, path), sla);
}

export function getSlaAnnotation(method: string, path: string): SlaAnnotation | undefined {
  return slaRegistry.get(routeKey(method, path));
}

export function applySlaAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const sla = getSlaAnnotation(route.method, route.path);
    if (!sla) return route;
    return {
      ...route,
      meta: {
        ...(route.meta ?? {}),
        sla,
      },
    };
  });
}

export function clearSlaRegistry(): void {
  slaRegistry.clear();
}

export function getSlaSummary(): Array<{ key: string; sla: SlaAnnotation }> {
  return Array.from(slaRegistry.entries()).map(([key, sla]) => ({ key, sla }));
}
