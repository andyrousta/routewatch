import { RouteInfo } from './types';

export type CostTier = 'free' | 'low' | 'medium' | 'high' | 'critical';

export interface CostAnnotation {
  tier: CostTier;
  estimatedMs?: number;
  notes?: string;
}

const costRegistry = new Map<string, CostAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setCostAnnotation(method: string, path: string, annotation: CostAnnotation): void {
  costRegistry.set(routeKey(method, path), annotation);
}

export function getCostAnnotation(method: string, path: string): CostAnnotation | undefined {
  return costRegistry.get(routeKey(method, path));
}

export function applyCostAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotation = getCostAnnotation(route.method, route.path);
    if (!annotation) return route;
    return { ...route, cost: annotation };
  });
}

export function clearCostRegistry(): void {
  costRegistry.clear();
}

export function getCostSummary(): Record<CostTier, number> {
  const summary: Record<CostTier, number> = {
    free: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const annotation of costRegistry.values()) {
    summary[annotation.tier]++;
  }
  return summary;
}
