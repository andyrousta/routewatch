import { RouteInfo } from './types';

type ExampleMap = Record<string, { request?: unknown; response?: unknown }>;

const exampleRegistry: ExampleMap = {};

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setExampleAnnotation(
  method: string,
  path: string,
  examples: { request?: unknown; response?: unknown }
): void {
  const key = routeKey(method, path);
  exampleRegistry[key] = examples;
}

export function getExampleAnnotation(
  method: string,
  path: string
): { request?: unknown; response?: unknown } | undefined {
  const key = routeKey(method, path);
  return exampleRegistry[key];
}

export function applyExampleAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const examples = getExampleAnnotation(route.method, route.path);
    if (!examples) return route;
    return {
      ...route,
      metadata: {
        ...(route.metadata ?? {}),
        examples,
      },
    };
  });
}

export function clearExampleRegistry(): void {
  for (const key of Object.keys(exampleRegistry)) {
    delete exampleRegistry[key];
  }
}

export function getExampleSummary(): ExampleMap {
  return { ...exampleRegistry };
}
