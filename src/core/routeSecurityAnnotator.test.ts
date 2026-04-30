import {
  setSecuritySchemes,
  getSecuritySchemes,
  applySecurityAnnotations,
  clearSecurityRegistry,
  getSecuritySummary,
  SecurityScheme,
} from './routeSecurityAnnotator';
import { RouteInfo } from './types';

const baseRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'GET', path: '/public/health', middleware: [] },
];

const bearerScheme: SecurityScheme = { type: 'http', scheme: 'bearer' };
const apiKeyScheme: SecurityScheme = { type: 'apiKey', name: 'X-API-Key', in: 'header' };

beforeEach(() => {
  clearSecurityRegistry();
});

describe('setSecuritySchemes / getSecuritySchemes', () => {
  it('stores and retrieves security schemes by route key', () => {
    setSecuritySchemes('GET', '/users', [bearerScheme]);
    expect(getSecuritySchemes('GET', '/users')).toEqual([bearerScheme]);
  });

  it('returns undefined for unregistered routes', () => {
    expect(getSecuritySchemes('DELETE', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    setSecuritySchemes('get', '/users', [apiKeyScheme]);
    expect(getSecuritySchemes('GET', '/users')).toEqual([apiKeyScheme]);
  });
});

describe('applySecurityAnnotations', () => {
  it('annotates matching routes with security schemes', () => {
    setSecuritySchemes('GET', '/users', [bearerScheme]);
    setSecuritySchemes('POST', '/users', [bearerScheme, apiKeyScheme]);
    const annotated = applySecurityAnnotations(baseRoutes);
    expect((annotated[0] as any).security).toEqual([bearerScheme]);
    expect((annotated[1] as any).security).toEqual([bearerScheme, apiKeyScheme]);
  });

  it('leaves unregistered routes unchanged', () => {
    setSecuritySchemes('GET', '/users', [bearerScheme]);
    const annotated = applySecurityAnnotations(baseRoutes);
    expect((annotated[2] as any).security).toBeUndefined();
  });

  it('returns empty array unchanged when no registry entries exist', () => {
    expect(applySecurityAnnotations([])).toEqual([]);
  });
});

describe('getSecuritySummary', () => {
  it('returns all registered security schemes as a record', () => {
    setSecuritySchemes('GET', '/users', [bearerScheme]);
    setSecuritySchemes('POST', '/login', [apiKeyScheme]);
    const summary = getSecuritySummary();
    expect(summary['GET:/users']).toEqual([bearerScheme]);
    expect(summary['POST:/login']).toEqual([apiKeyScheme]);
  });

  it('returns empty object when registry is empty', () => {
    expect(getSecuritySummary()).toEqual({});
  });
});

describe('clearSecurityRegistry', () => {
  it('removes all entries from the registry', () => {
    setSecuritySchemes('GET', '/users', [bearerScheme]);
    clearSecurityRegistry();
    expect(getSecuritySchemes('GET', '/users')).toBeUndefined();
    expect(getSecuritySummary()).toEqual({});
  });
});
