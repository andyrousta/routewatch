import {
  setOwnerAnnotation,
  getOwnerAnnotation,
  applyOwnerAnnotations,
  clearOwnerRegistry,
  getOwnerSummary,
  routeKey,
} from './routeOwnerAnnotator';
import { RouteInfo } from './types';

const baseRoute = (method: string, path: string): RouteInfo => ({
  method,
  path,
});

beforeEach(() => {
  clearOwnerRegistry();
});

describe('routeKey', () => {
  it('produces uppercase method:path key', () => {
    expect(routeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setOwnerAnnotation / getOwnerAnnotation', () => {
  it('stores and retrieves an owner annotation', () => {
    setOwnerAnnotation('GET', '/users', { team: 'platform', contact: 'platform@example.com' });
    expect(getOwnerAnnotation('GET', '/users')).toEqual({
      team: 'platform',
      contact: 'platform@example.com',
    });
  });

  it('returns undefined for unregistered routes', () => {
    expect(getOwnerAnnotation('POST', '/unknown')).toBeUndefined();
  });
});

describe('applyOwnerAnnotations', () => {
  it('merges owner into route metadata', () => {
    setOwnerAnnotation('GET', '/users', { team: 'backend', slackChannel: '#backend' });
    const routes = [baseRoute('GET', '/users'), baseRoute('POST', '/items')];
    const result = applyOwnerAnnotations(routes);

    expect((result[0] as any).metadata.owner).toEqual({
      team: 'backend',
      slackChannel: '#backend',
    });
    expect((result[1] as any).metadata).toBeUndefined();
  });

  it('preserves existing metadata fields', () => {
    setOwnerAnnotation('DELETE', '/posts/:id', { team: 'content' });
    const route = { ...baseRoute('DELETE', '/posts/:id'), metadata: { deprecated: true } };
    const [result] = applyOwnerAnnotations([route]);
    expect((result as any).metadata.deprecated).toBe(true);
    expect((result as any).metadata.owner.team).toBe('content');
  });
});

describe('getOwnerSummary', () => {
  it('returns all registered owners as a plain object', () => {
    setOwnerAnnotation('GET', '/a', { team: 'alpha' });
    setOwnerAnnotation('POST', '/b', { team: 'beta' });
    const summary = getOwnerSummary();
    expect(summary['GET:/a']).toEqual({ team: 'alpha' });
    expect(summary['POST:/b']).toEqual({ team: 'beta' });
  });
});

describe('clearOwnerRegistry', () => {
  it('removes all entries', () => {
    setOwnerAnnotation('GET', '/x', { team: 'x-team' });
    clearOwnerRegistry();
    expect(getOwnerAnnotation('GET', '/x')).toBeUndefined();
    expect(Object.keys(getOwnerSummary())).toHaveLength(0);
  });
});
