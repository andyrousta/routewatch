import { generateOpenApiDocument, buildOpenApiPaths } from './routeOpenApiExporter';
import { RouteInfo } from './types';
import { setParamAnnotations, clearParamRegistry } from './routeParamAnnotator';
import { setQueryParams, clearQueryRegistry } from './routeQueryAnnotator';
import { setBodyAnnotation, clearBodyRegistry } from './routeBodyAnnotator';
import { setResponseAnnotations, clearResponseRegistry } from './routeResponseAnnotator';
import { setSecuritySchemes, clearSecurityRegistry } from './routeSecurityAnnotator';
import { setTagsForRoute, clearTagRegistry } from './routeTagging';

const baseRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'GET', path: '/users/:id', middleware: [] },
];

beforeEach(() => {
  clearParamRegistry();
  clearQueryRegistry();
  clearBodyRegistry();
  clearResponseRegistry();
  clearSecurityRegistry();
  clearTagRegistry();
});

describe('buildOpenApiPaths', () => {
  it('converts Express-style path params to OpenAPI format', () => {
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths).toHaveProperty('/users/:id');
  });

  it('groups methods under the same path key', () => {
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths['/users']).toHaveProperty('get');
    expect(paths['/users']).toHaveProperty('post');
  });

  it('defaults to 200 OK response when no annotations provided', () => {
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths['/users']['get'].responses).toEqual({ '200': { description: 'OK' } });
  });

  it('includes path parameters from param annotations', () => {
    setParamAnnotations('GET', '/users/:id', { id: { type: 'string', description: 'User ID' } });
    const paths = buildOpenApiPaths(baseRoutes);
    const params = paths['/users/:id']['get'].parameters ?? [];
    const idParam = params.find((p) => p.name === 'id');
    expect(idParam).toBeDefined();
    expect(idParam?.in).toBe('path');
    expect(idParam?.required).toBe(true);
  });

  it('includes query parameters from query annotations', () => {
    setQueryParams('GET', '/users', { page: { type: 'integer', required: false } });
    const paths = buildOpenApiPaths(baseRoutes);
    const params = paths['/users']['get'].parameters ?? [];
    const pageParam = params.find((p) => p.name === 'page');
    expect(pageParam).toBeDefined();
    expect(pageParam?.in).toBe('query');
  });

  it('includes requestBody when body annotation is set', () => {
    setBodyAnnotation('POST', '/users', { type: 'object', properties: { name: { type: 'string' } } });
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths['/users']['post'].requestBody).toBeDefined();
  });

  it('includes tags when tag annotations are set', () => {
    setTagsForRoute('GET', '/users', ['users', 'public']);
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths['/users']['get'].tags).toEqual(['users', 'public']);
  });

  it('includes security when security schemes are set', () => {
    setSecuritySchemes('GET', '/users/:id', ['bearerAuth']);
    const paths = buildOpenApiPaths(baseRoutes);
    expect(paths['/users/:id']['get'].security).toEqual([{ bearerAuth: [] }]);
  });

  it('marks route as deprecated when deprecated flag is true', () => {
    const deprecatedRoutes: RouteInfo[] = [{ method: 'GET', path: '/legacy', middleware: [], deprecated: true }];
    const paths = buildOpenApiPaths(deprecatedRoutes);
    expect(paths['/legacy']['get'].deprecated).toBe(true);
  });
});

describe('generateOpenApiDocument', () => {
  it('returns a valid OpenAPI 3.0.3 document structure', () => {
    const doc = generateOpenApiDocument(baseRoutes, { title: 'Test API', version: '1.0.0' });
    expect(doc.openapi).toBe('3.0.3');
    expect(doc.info.title).toBe('Test API');
    expect(doc.info.version).toBe('1.0.0');
    expect(doc.paths).toBeDefined();
  });

  it('includes optional description in info', () => {
    const doc = generateOpenApiDocument(baseRoutes, {
      title: 'My API',
      version: '2.0.0',
      description: 'A test API',
    });
    expect(doc.info.description).toBe('A test API');
  });
});
