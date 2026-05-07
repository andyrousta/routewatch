import { RouteInfo } from './types';

type AliasMap = Record<string, string[]>;

const aliasRegistry: AliasMap = {};

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setAliasAnnotation(method: string, path: string, aliases: string[]): void {
  aliasRegistry[routeKey(method, path)] = aliases;
}

export function getAliasAnnotation(method: string, path: string): string[] {
  return aliasRegistry[routeKey(method, path)] ?? [];
}

export function applyAliasAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const aliases = getAliasAnnotation(route.method, route.path);
    if (aliases.length === 0) return route;
    return { ...route, aliases };
  });
}

export function clearAliasRegistry(): void {
  Object.keys(aliasRegistry).forEach((key) => delete aliasRegistry[key]);
}

export function getAliasSummary(): Record<string, string[]> {
  return { ...aliasRegistry };
}
