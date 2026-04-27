import { RouteInfo } from './types';

interface BodySchema {
  contentType: string;
  required?: boolean;
  fields?: Record<string, { type: string; required?: boolean; description?: string }>;
  description?: string;
}

const bodyRegistry = new Map<string, BodySchema>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setBodyAnnotation(method: string, path: string, schema: BodySchema): void {
  bodyRegistry.set(routeKey(method, path), schema);
}

export function getBodyAnnotation(method: string, path: string): BodySchema | undefined {
  return bodyRegistry.get(routeKey(method, path));
}

export function applyBodyAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const schema = bodyRegistry.get(routeKey(route.method, route.path));
    if (!schema) return route;
    return {
      ...route,
      body: schema,
    };
  });
}

export function clearBodyRegistry(): void {
  bodyRegistry.clear();
}

export function getBodySummary(): Record<string, BodySchema> {
  const result: Record<string, BodySchema> = {};
  bodyRegistry.forEach((schema, key) => {
    result[key] = schema;
  });
  return result;
}
