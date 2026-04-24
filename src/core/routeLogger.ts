import { RouteInfo } from './types';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

export interface RouteLoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  output?: (entry: LogEntry) => void;
}

const defaultOutput = (entry: LogEntry): void => {
  const prefix = `[routewatch] [${entry.level.toUpperCase()}] ${entry.timestamp.toISOString()}`;
  const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
  console.log(`${prefix} ${entry.message}${meta}`);
};

let loggerOptions: RouteLoggerOptions = {
  enabled: true,
  level: 'info',
  output: defaultOutput,
};

export function configureLogger(options: RouteLoggerOptions): void {
  loggerOptions = { ...loggerOptions, ...options };
}

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!loggerOptions.enabled) return;
  const minLevel = loggerOptions.level ?? 'info';
  if (levelPriority[level] < levelPriority[minLevel]) return;

  const entry: LogEntry = { level, message, timestamp: new Date(), meta };
  const output = loggerOptions.output ?? defaultOutput;
  output(entry);
}

export function logRoutesDetected(routes: RouteInfo[]): void {
  log('info', `Detected ${routes.length} route(s)`, {
    methods: [...new Set(routes.map((r) => r.method))],
  });
}

export function logRouteChanged(route: RouteInfo): void {
  log('info', `Route changed: ${route.method} ${route.path}`);
}

export function logDocumentationWritten(outputPath: string): void {
  log('info', `Documentation written to ${outputPath}`);
}

export function logWatcherStarted(watchPath: string): void {
  log('debug', `Watcher started on ${watchPath}`);
}

export function logError(message: string, error?: unknown): void {
  log('error', message, error instanceof Error ? { error: error.message } : undefined);
}
