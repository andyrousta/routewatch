/**
 * Represents a single extracted API route.
 */
export interface RouteInfo {
  method: string;
  path: string;
  params?: string[];
  description?: string;
  tags?: string[];
  deprecated?: boolean;
}

/**
 * Configuration options for the routewatch middleware.
 */
export interface RouteWatchOptions {
  outputDir?: string;
  outputFormat?: 'markdown' | 'json';
  watch?: boolean;
  filter?: import('./routeFilter').FilterOptions;
  onUpdate?: (routes: RouteInfo[]) => void;
}

/**
 * Represents the generated documentation output.
 */
export interface DocOutput {
  routes: RouteInfo[];
  generatedAt: string;
  version?: string;
}
