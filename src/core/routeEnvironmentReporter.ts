/**
 * routeEnvironmentReporter.ts
 * Generates a human-readable report of routes grouped by environment.
 */

import { RouteInfo } from './types';
import { applyEnvironmentAnnotations, filterByEnvironment, getEnvironmentSummary } from './routeEnvironmentAnnotator';

type AnnotatedRoute = RouteInfo & { environments?: string[] };

export function buildEnvironmentReport(
  routes: RouteInfo[]
): Record<string, AnnotatedRoute[]> {
  const annotated = applyEnvironmentAnnotations(routes);
  const envSet = new Set<string>();

  for (const route of annotated) {
    if (route.environments) {
      route.environments.forEach((e) => envSet.add(e));
    } else {
      envSet.add('all');
    }
  }

  const report: Record<string, AnnotatedRoute[]> = {};
  for (const env of envSet) {
    report[env] = filterByEnvironment(annotated, env);
  }

  return report;
}

export function formatEnvironmentReport(
  routes: RouteInfo[]
): string {
  const annotated = applyEnvironmentAnnotations(routes);
  const summary = getEnvironmentSummary(annotated);
  const lines: string[] = ['# Environment Report', ''];

  for (const [env, count] of Object.entries(summary)) {
    lines.push(`## ${env} (${count} route${count !== 1 ? 's' : ''})`);
    const envRoutes = filterByEnvironment(annotated, env);
    for (const route of envRoutes) {
      lines.push(`  - [${route.method.toUpperCase()}] ${route.path}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function generateEnvironmentReport(routes: RouteInfo[]): string {
  return formatEnvironmentReport(routes);
}
