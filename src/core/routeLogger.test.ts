import {
  configureLogger,
  log,
  logRoutesDetected,
  logRouteChanged,
  logDocumentationWritten,
  logWatcherStarted,
  logError,
  LogEntry,
} from './routeLogger';
import { RouteInfo } from './types';

const captureOutput = (): { entries: LogEntry[]; output: (entry: LogEntry) => void } => {
  const entries: LogEntry[] = [];
  return { entries, output: (entry) => entries.push(entry) };
};

const sampleRoute: RouteInfo = { method: 'GET', path: '/api/users' };

describe('routeLogger', () => {
  afterEach(() => {
    configureLogger({ enabled: true, level: 'info', output: undefined });
  });

  it('logs at the correct level', () => {
    const { entries, output } = captureOutput();
    configureLogger({ output });
    log('info', 'hello world');
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('info');
    expect(entries[0].message).toBe('hello world');
  });

  it('suppresses logs below the configured level', () => {
    const { entries, output } = captureOutput();
    configureLogger({ level: 'warn', output });
    log('debug', 'debug message');
    log('info', 'info message');
    log('warn', 'warn message');
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('warn');
  });

  it('does not log when disabled', () => {
    const { entries, output } = captureOutput();
    configureLogger({ enabled: false, output });
    log('error', 'should not appear');
    expect(entries).toHaveLength(0);
  });

  it('logRoutesDetected includes route count and methods', () => {
    const { entries, output } = captureOutput();
    configureLogger({ output });
    logRoutesDetected([sampleRoute, { method: 'POST', path: '/api/users' }]);
    expect(entries[0].message).toContain('2 route(s)');
    expect(entries[0].meta?.methods).toEqual(expect.arrayContaining(['GET', 'POST']));
  });

  it('logRouteChanged logs the method and path', () => {
    const { entries, output } = captureOutput();
    configureLogger({ output });
    logRouteChanged(sampleRoute);
    expect(entries[0].message).toContain('GET /api/users');
  });

  it('logDocumentationWritten logs the output path', () => {
    const { entries, output } = captureOutput();
    configureLogger({ output });
    logDocumentationWritten('./docs/api.md');
    expect(entries[0].message).toContain('./docs/api.md');
  });

  it('logWatcherStarted logs at debug level', () => {
    const { entries, output } = captureOutput();
    configureLogger({ level: 'debug', output });
    logWatcherStarted('./src');
    expect(entries[0].level).toBe('debug');
    expect(entries[0].message).toContain('./src');
  });

  it('logError includes error message in meta', () => {
    const { entries, output } = captureOutput();
    configureLogger({ output });
    logError('Something failed', new Error('oops'));
    expect(entries[0].level).toBe('error');
    expect(entries[0].meta?.error).toBe('oops');
  });
});
