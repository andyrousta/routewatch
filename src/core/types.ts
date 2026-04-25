export interface RouteInfo {
  method: string;
  path: string;
  middlewares: string[];
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  deprecatedSince?: string;
  replacedBy?: string;
  removalDate?: string;
}

export interface DocConfig {
  outputPath?: string;
  format?: 'markdown' | 'json';
  title?: string;
  watchMode?: boolean;
  silent?: boolean;
  include?: string[];
  exclude?: string[];
}

export interface RouteWatchOptions extends DocConfig {
  app: any;
}

export interface CacheEntry {
  hash: string;
  routes: RouteInfo[];
  timestamp: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
