export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface RouteMetadata {
  deprecated?: boolean;
  description?: string;
  tags?: string[];
  rateLimit?: {
    max: number;
    windowMs: number;
  };
  auth?: {
    scheme: string;
    scopes?: string[];
    description?: string;
  };
  [key: string]: unknown;
}

export interface RouteInfo {
  method: string;
  path: string;
  middleware: string[];
  metadata?: RouteMetadata;
}

export interface RouteWatchOptions {
  output?: string;
  format?: 'json' | 'markdown';
  watch?: boolean;
  silent?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
