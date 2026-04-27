import { RouteInfo } from './types';

export interface ResponseAnnotation {
  statusCode: number;
  description: string;
  schema?: string;
}

type ResponseMap = Record<string, ResponseAnnotation[]>;

const responseRegistry: ResponseMap = {};

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setResponseAnnotations(
  method: string,
  path: string,
  annotations: ResponseAnnotation[]
): void {
  const key = routeKey(method, path);
  responseRegistry[key] = annotations;
}

export function getResponseAnnotations(
  method: string,
  path: string
): ResponseAnnotation[] {
  const key = routeKey(method, path);
  return responseRegistry[key] ?? [];
}

export function applyResponseAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotations = getResponseAnnotations(route.method, route.path);
    if (annotations.length === 0) return route;
    return {
      ...route,
      metadata: {
        ...(route.metadata ?? {}),
        responses: annotations,
      },
    };
  });
}

export function clearResponseRegistry(): void {
  Object.keys(responseRegistry).forEach((key) => {
    delete responseRegistry[key];
  });
}

export function getResponseSummary(
  routes: RouteInfo[]
): Record<string, ResponseAnnotation[]> {
  const summary: Record<string, ResponseAnnotation[]> = {};
  routes.forEach((route) => {
    const key = routeKey(route.method, route.path);
    const annotations = responseRegistry[key];
    if (annotations && annotations.length > 0) {
      summary[key] = annotations;
    }
  });
  return summary;
}
