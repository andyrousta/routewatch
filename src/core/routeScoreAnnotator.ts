import { RouteInfo } from './types';

export type ScoreCategory = 'documentation' | 'stability' | 'security' | 'performance';

export interface RouteScore {
  total: number;
  breakdown: Record<ScoreCategory, number>;
}

const scoreRegistry = new Map<string, RouteScore>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteScore(method: string, path: string, score: RouteScore): void {
  scoreRegistry.set(routeKey(method, path), score);
}

export function getRouteScore(method: string, path: string): RouteScore | undefined {
  return scoreRegistry.get(routeKey(method, path));
}

export function computeScore(route: RouteInfo): RouteScore {
  const breakdown: Record<ScoreCategory, number> = {
    documentation: route.summary ? 25 : 0,
    stability: (route as any).stability === 'stable' ? 25 : (route as any).stability === 'beta' ? 15 : 5,
    security: (route as any).auth ? 25 : 0,
    performance: (route as any).timeout ? 25 : 10,
  };
  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  return { total, breakdown };
}

export function applyScoreAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const existing = getRouteScore(route.method, route.path);
    const score = existing ?? computeScore(route);
    return { ...route, score } as RouteInfo & { score: RouteScore };
  });
}

export function clearScoreRegistry(): void {
  scoreRegistry.clear();
}

export function getScoreRegistry(): Map<string, RouteScore> {
  return new Map(scoreRegistry);
}
