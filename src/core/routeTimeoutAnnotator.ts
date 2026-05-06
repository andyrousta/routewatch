import { RouteInfo } from './types';

type TimeoutAnnotation = {
  ms: number;
  message?: string;
};

const timeoutRegistry = new Map<string, TimeoutAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setTimeout(
  method: string,
  path: string,
  annotation: TimeoutAnnotation
): void {
  timeoutRegistry.set(routeKey(method, path), annotation);
}

export function getTimeout(
  method: string,
  path: string
): TimeoutAnnotation | undefined {
  return timeoutRegistry.get(routeKey(method, path));
}

export function applyTimeoutAnnotations(
  routes: RouteInfo[]
): (RouteInfo & { timeout?: TimeoutAnnotation })[] {
  return routes.map((route) => {
    const annotation = timeoutRegistry.get(routeKey(route.method, route.path));
    if (annotation) {
      return { ...route, timeout: annotation };
    }
    return route;
  });
}

export function clearTimeoutRegistry(): void {
  timeoutRegistry.clear();
}

export function getTimeoutSummary(): Record<string, TimeoutAnnotation> {
  const summary: Record<string, TimeoutAnnotation> = {};
  for (const [key, value] of timeoutRegistry.entries()) {
    summary[key] = value;
  }
  return summary;
}
