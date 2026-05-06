import { RouteInfo } from './types';
import { groupRoutesByAnnotation } from './routeGroupAnnotator';

export interface GroupSummary {
  group: string;
  count: number;
  methods: string[];
  paths: string[];
}

export function buildGroupSummaries(routes: RouteInfo[]): GroupSummary[] {
  const grouped = groupRoutesByAnnotation(routes);

  return Object.entries(grouped).map(([group, groupRoutes]) => ({
    group,
    count: groupRoutes.length,
    methods: [...new Set(groupRoutes.map((r) => r.method.toUpperCase()))].sort(),
    paths: [...new Set(groupRoutes.map((r) => r.path))].sort(),
  }));
}

export function formatGroupReport(summaries: GroupSummary[]): string {
  if (summaries.length === 0) {
    return 'No route groups found.\n';
  }

  const lines: string[] = ['# Route Group Report\n'];

  for (const summary of summaries) {
    lines.push(`## ${summary.group}`);
    lines.push(`- **Routes:** ${summary.count}`);
    lines.push(`- **Methods:** ${summary.methods.join(', ')}`);
    lines.push(`- **Paths:**`);
    for (const path of summary.paths) {
      lines.push(`  - ${path}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function generateGroupReport(routes: RouteInfo[]): string {
  const summaries = buildGroupSummaries(routes);
  return formatGroupReport(summaries);
}
