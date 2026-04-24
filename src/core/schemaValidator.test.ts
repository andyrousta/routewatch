import { validateRoute, validateRoutes, SchemaRule } from './schemaValidator';
import { RouteInfo } from './routeExtractor';

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  method: 'GET',
  path: '/users',
  description: '',
  middlewares: [],
  ...overrides,
});

describe('validateRoute', () => {
  it('passes a valid route with default rules', () => {
    const result = validateRoute(makeRoute());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when path is empty', () => {
    const result = validateRoute(makeRoute({ path: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Route path must not be empty.');
  });

  it('fails when method is empty', () => {
    const result = validateRoute(makeRoute({ method: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Route method must not be empty.');
  });

  it('fails when method is not in allowed list', () => {
    const result = validateRoute(makeRoute({ method: 'CONNECT' }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not in the allowed list/);
  });

  it('fails when requireDescription is true and description is missing', () => {
    const rules: SchemaRule = { requireDescription: true };
    const result = validateRoute(makeRoute({ description: '' }), rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/missing a description/);
  });

  it('passes when requireDescription is true and description is provided', () => {
    const rules: SchemaRule = { requireDescription: true };
    const result = validateRoute(makeRoute({ description: 'Returns all users' }), rules);
    expect(result.valid).toBe(true);
  });

  it('adds warning when requireParams is true and path has params', () => {
    const rules: SchemaRule = { requireParams: true };
    const result = validateRoute(makeRoute({ path: '/users/:id' }), rules);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/path params/);
  });
});

describe('validateRoutes', () => {
  it('aggregates errors from multiple routes', () => {
    const routes = [
      makeRoute({ path: '' }),
      makeRoute({ method: '' }),
    ];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('returns valid when all routes pass', () => {
    const routes = [makeRoute(), makeRoute({ method: 'POST', path: '/users' })];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(true);
  });
});
