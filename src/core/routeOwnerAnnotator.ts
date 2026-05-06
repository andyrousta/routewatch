/**
 * routeOwnerAnnotator.ts
 * Allows annotating routes with ownership metadata (team, contact, etc.)
 */

import { RouteInfo } from './types';

export interface OwnerAnnotation {
  team: string;
  contact?: string;
  slackChannel?: string;
}

const ownerRegistry = new Map<string, OwnerAnnotation>();

export function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setOwnerAnnotation(method: string, path: string, owner: OwnerAnnotation): void {
  ownerRegistry.set(routeKey(method, path), owner);
}

export function getOwnerAnnotation(method: string, path: string): OwnerAnnotation | undefined {
  return ownerRegistry.get(routeKey(method, path));
}

export function applyOwnerAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const owner = ownerRegistry.get(routeKey(route.method, route.path));
    if (!owner) return route;
    return {
      ...route,
      metadata: {
        ...((route as any).metadata ?? {}),
        owner,
      },
    };
  });
}

export function clearOwnerRegistry(): void {
  ownerRegistry.clear();
}

export function getOwnerSummary(): Record<string, OwnerAnnotation> {
  return Object.fromEntries(ownerRegistry.entries());
}
