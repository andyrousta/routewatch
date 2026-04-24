import { RouteInfo, DocOutput } from './types';
import { groupRoutesByPrefix } from './routeFilter';

/**
 * Formats routes as a JSON documentation object.
 */
export function formatAsJson(routes: RouteInfo[], version?: string): DocOutput {
  return {
    routes,
    generatedAt: new Date().toISOString(),
    version,
  };
}

/**
 * Formats a single route as a markdown table row.
 */
function routeToMarkdownRow(route: RouteInfo): string {
  const method = `\`${route.method.toUpperCase()}\``;
  const deprecated = route.deprecated ? ' _(deprecated)_' : '';
  const description = route.description ?? '';
  const tags = route.tags?.join(', ') ?? '';
  return `| ${method} | \`${route.path}\` | ${description}${deprecated} | ${tags} |`;
}

/**
 * Formats routes as grouped markdown documentation.
 */
export function formatAsMarkdown(routes: RouteInfo[], title = 'API Documentation'): string {
  const lines: string[] = [
    `# ${title}`,
    '',
    `> Generated at ${new Date().toISOString()}`,
    '',
  ];

  const groups = groupRoutesByPrefix(routes);

  for (const [prefix, groupRoutes] of Object.entries(groups)) {
    lines.push(`## /${prefix}`);
    lines.push('');
    lines.push('| Method | Path | Description | Tags |');
    lines.push('|--------|------|-------------|------|');
    for (const route of groupRoutes) {
      lines.push(routeToMarkdownRow(route));
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Formats routes as a plain text summary.
 */
export function formatAsSummary(routes: RouteInfo[]): string {
  const lines = routes.map(
    (r) => `${r.method.toUpperCase().padEnd(7)} ${r.path}`
  );
  return lines.join('\n');
}
