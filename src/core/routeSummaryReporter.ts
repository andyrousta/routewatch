import { RouteInfo } from './types';

export interface RouteSummaryReport {
  totalRoutes: number;
  byMethod: Record<string, number>;
  byVersion: Record<string, number>;
  deprecatedCount: number;
  taggedCount: number;
  averagePathDepth: number;
  topPrefixes: Array<{ prefix: string; count: number }>;
}

export function computePathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

export function extractTopPrefix(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : '/';
}

export function generateSummaryReport(routes: RouteInfo[]): RouteSummaryReport {
  const byMethod: Record<string, number> = {};
  const byVersion: Record<string, number> = {};
  const prefixCounts: Record<string, number> = {};
  let deprecatedCount = 0;
  let taggedCount = 0;
  let totalDepth = 0;

  for (const route of routes) {
    const method = route.method.toUpperCase();
    byMethod[method] = (byMethod[method] ?? 0) + 1;

    const versionMatch = route.path.match(/\/v(\d+)/);
    const version = versionMatch ? `v${versionMatch[1]}` : 'unversioned';
    byVersion[version] = (byVersion[version] ?? 0) + 1;

    if ((route as any).deprecated) deprecatedCount++;
    if ((route as any).tags?.length > 0) taggedCount++;

    totalDepth += computePathDepth(route.path);

    const prefix = extractTopPrefix(route.path);
    prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1;
  }

  const topPrefixes = Object.entries(prefixCounts)
    .map(([prefix, count]) => ({ prefix, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRoutes: routes.length,
    byMethod,
    byVersion,
    deprecatedCount,
    taggedCount,
    averagePathDepth: routes.length > 0 ? totalDepth / routes.length : 0,
    topPrefixes,
  };
}

export function formatSummaryReport(report: RouteSummaryReport): string {
  const lines: string[] = [
    '## Route Summary Report',
    '',
    `- **Total Routes:** ${report.totalRoutes}`,
    `- **Deprecated:** ${report.deprecatedCount}`,
    `- **Tagged:** ${report.taggedCount}`,
    `- **Avg Path Depth:** ${report.averagePathDepth.toFixed(2)}`,
    '',
    '### By Method',
    ...Object.entries(report.byMethod).map(([m, c]) => `- ${m}: ${c}`),
    '',
    '### By Version',
    ...Object.entries(report.byVersion).map(([v, c]) => `- ${v}: ${c}`),
    '',
    '### Top Prefixes',
    ...report.topPrefixes.map(({ prefix, count }) => `- ${prefix}: ${count}`),
  ];
  return lines.join('\n');
}
