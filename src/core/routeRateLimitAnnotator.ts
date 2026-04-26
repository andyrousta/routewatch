import { RouteInfo } from './types';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  label?: string;
}

const rateLimitRegistry = new Map<string, RateLimitConfig>();

export function setRateLimit(method: string, path: string, config: RateLimitConfig): void {
  const key = `${method.toUpperCase()}:${path}`;
  rateLimitRegistry.set(key, config);
}

export function getRateLimit(method: string, path: string): RateLimitConfig | undefined {
  const key = `${method.toUpperCase()}:${path}`;
  return rateLimitRegistry.get(key);
}

export function applyRateLimitAnnotations(routes: RouteInfo[]): RouteInfo[] {
  return routes.map((route) => {
    const config = getRateLimit(route.method, route.path);
    if (!config) return route;

    const label = config.label ?? `${config.maxRequests} req / ${config.windowMs}ms`;
    return {
      ...route,
      metadata: {
        ...(route.metadata ?? {}),
        rateLimit: {
          windowMs: config.windowMs,
          maxRequests: config.maxRequests,
          label,
        },
      },
    };
  });
}

export function clearRateLimitRegistry(): void {
  rateLimitRegistry.clear();
}

export function getRateLimitSummary(): Record<string, RateLimitConfig> {
  const summary: Record<string, RateLimitConfig> = {};
  rateLimitRegistry.forEach((config, key) => {
    summary[key] = config;
  });
  return summary;
}
