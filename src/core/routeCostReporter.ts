import { RouteInfo } from './types';
import { getCostAnnotation, CostTier, getCostSummary } from './routeCostAnnotator';

const TIER_ORDER: CostTier[] = ['free', 'low', 'medium', 'high', 'critical'];

export interface CostReportEntry {
  method: string;
  path: string;
  tier: CostTier;
  estimatedMs?: number;
  notes?: string;
}

export function buildCostReport(routes: RouteInfo[]): CostReportEntry[] {
  const entries: CostReportEntry[] = [];
  for (const route of routes) {
    const annotation = getCostAnnotation(route.method, route.path);
    if (annotation) {
      entries.push({
        method: route.method.toUpperCase(),
        path: route.path,
        tier: annotation.tier,
        estimatedMs: annotation.estimatedMs,
        notes: annotation.notes,
      });
    }
  }
  return entries.sort(
    (a, b) => TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier)
  );
}

export function formatCostReport(entries: CostReportEntry[]): string {
  if (entries.length === 0) return '# Cost Report\n\nNo cost annotations found.\n';

  const summary = getCostSummary();
  const summaryLine = TIER_ORDER.filter((t) => summary[t] > 0)
    .map((t) => `${t}: ${summary[t]}`)
    .join(' | ');

  const rows = entries
    .map((e) => {
      const ms = e.estimatedMs !== undefined ? `${e.estimatedMs}ms` : '-';
      const notes = e.notes ?? '-';
      return `| ${e.method} | ${e.path} | ${e.tier} | ${ms} | ${notes} |`;
    })
    .join('\n');

  return [
    '# Cost Report',
    '',
    `**Summary:** ${summaryLine}`,
    '',
    '| Method | Path | Tier | Est. Time | Notes |',
    '|--------|------|------|-----------|-------|',
    rows,
    '',
  ].join('\n');
}

export function generateCostReport(routes: RouteInfo[]): string {
  const entries = buildCostReport(routes);
  return formatCostReport(entries);
}
