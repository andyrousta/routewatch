import * as fs from 'fs';
import * as path from 'path';
import { RouteInfo } from './types';
import { formatAsJson, formatAsMarkdown, formatAsSummary } from './routeFormatter';

export type ExportFormat = 'json' | 'markdown' | 'summary';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  pretty?: boolean;
}

export function exportRoutes(routes: RouteInfo[], options: ExportOptions): void {
  const { format, outputPath, pretty = true } = options;

  const content = renderContent(routes, format, pretty);
  const resolvedPath = path.resolve(outputPath);

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(resolvedPath, content, 'utf-8');
}

export function renderContent(
  routes: RouteInfo[],
  format: ExportFormat,
  pretty: boolean = true
): string {
  switch (format) {
    case 'json':
      return formatAsJson(routes, pretty);
    case 'markdown':
      return formatAsMarkdown(routes);
    case 'summary':
      return formatAsSummary(routes);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function getDefaultOutputPath(format: ExportFormat, baseDir: string = '.'): string {
  const extensions: Record<ExportFormat, string> = {
    json: 'routes.json',
    markdown: 'routes.md',
    summary: 'routes-summary.txt',
  };
  return path.join(baseDir, extensions[format]);
}
