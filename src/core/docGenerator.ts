import { RouteInfo } from './routeExtractor';

export interface RouteDoc {
  method: string;
  path: string;
  description?: string;
  params?: string[];
  timestamp: string;
}

export interface ApiDoc {
  title: string;
  version: string;
  generatedAt: string;
  routes: RouteDoc[];
}

function extractParamsFromPath(routePath: string): string[] {
  const paramRegex = /:([^/]+)/g;
  const params: string[] = [];
  let match;
  while ((match = paramRegex.exec(routePath)) !== null) {
    params.push(match[1]);
  }
  return params;
}

export function generateDoc(
  routes: RouteInfo[],
  options: { title?: string; version?: string } = {}
): ApiDoc {
  const { title = 'API Documentation', version = '1.0.0' } = options;

  const routeDocs: RouteDoc[] = routes.map((route) => {
    const params = extractParamsFromPath(route.path);
    return {
      method: route.method.toUpperCase(),
      path: route.path,
      params: params.length > 0 ? params : undefined,
      timestamp: new Date().toISOString(),
    };
  });

  return {
    title,
    version,
    generatedAt: new Date().toISOString(),
    routes: routeDocs,
  };
}

export function generateMarkdown(doc: ApiDoc): string {
  const lines: string[] = [
    `# ${doc.title}`,
    `**Version:** ${doc.version}`,
    `**Generated:** ${doc.generatedAt}`,
    '',
    '## Routes',
    '',
  ];

  for (const route of doc.routes) {
    lines.push(`### \`${route.method} ${route.path}\``);
    if (route.params && route.params.length > 0) {
      lines.push(`**Params:** ${route.params.map((p) => `\`:${p}\``).join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
