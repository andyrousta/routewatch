import { RouteInfo } from './types';
import { getSlaAnnotation, SlaAnnotation } from './routeSlaAnnotator';

export interface SlaReportEntry {
  method: string;
  path: string;
  maxResponseTimeMs: number;
  priority: string;
  sloPercentage: string;
}

export function buildSlaReport(routes: RouteInfo[]): SlaReportEntry[] {
  const entries: SlaReportEntry[] = [];
  for (const route of routes) {
    const sla = getSlaAnnotation(route.method, route.path);
    if (!sla) continue;
    entries.push({
      method: route.method.toUpperCase(),
      path: route.path,
      maxResponseTimeMs: sla.maxResponseTimeMs,
      priority: sla.priority ?? 'medium',
      sloPercentage: sla.sloPercentage !== undefined ? `${sla.sloPercentage}%` : 'N/A',
    });
  }
  return entries.sort((a, b) => a.maxResponseTimeMs - b.maxResponseTimeMs);
}

export function formatSlaReport(entries: SlaReportEntry[]): string {
  if (entries.length === 0) return '# SLA Report\n\nNo SLA annotations found.\n';

  const header = '| Method | Path | Max Response (ms) | Priority | SLO |';
  const divider = '|--------|------|-------------------|----------|-----|';
  const rows = entries.map(
    (e) => `| ${e.method} | ${e.path} | ${e.maxResponseTimeMs} | ${e.priority} | ${e.sloPercentage} |`
  );

  return ['# SLA Report', '', header, divider, ...rows, ''].join('\n');
}

export function generateSlaReport(routes: RouteInfo[]): string {
  const entries = buildSlaReport(routes);
  return formatSlaReport(entries);
}
