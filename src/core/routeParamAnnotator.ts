import { RouteInfo } from './types';

interface ParamAnnotation {
  description?: string;
  type?: string;
  required?: boolean;
  example?: string;
}

type ParamMap = Record<string, ParamAnnotation>;

const paramRegistry = new Map<string, ParamMap>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setParamAnnotations(method: string, path: string, params: ParamMap): void {
  paramRegistry.set(routeKey(method, path), params);
}

export function getParamAnnotations(method: string, path: string): ParamMap | undefined {
  return paramRegistry.get(routeKey(method, path));
}

export function applyParamAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const annotations = getParamAnnotations(route.method, route.path);
    if (!annotations) return route;
    return {
      ...route,
      params: annotations,
    };
  });
}

export function clearParamRegistry(): void {
  paramRegistry.clear();
}

export function getParamSummary(method: string, path: string): string {
  const params = getParamAnnotations(method, path);
  if (!params || Object.keys(params).length === 0) return 'No path param annotations';
  return Object.entries(params)
    .map(([name, meta]) => {
      const parts = [`  :${name}`];
      if (meta.type) parts.push(`(${meta.type})`);
      if (meta.required !== undefined) parts.push(meta.required ? '[required]' : '[optional]');
      if (meta.description) parts.push(`- ${meta.description}`);
      return parts.join(' ');
    })
    .join('\n');
}
