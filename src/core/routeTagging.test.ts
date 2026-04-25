import {
  setTagsForRoute,
  getTagsForRoute,
  applyTags,
  groupRoutesByTag,
  clearTagRegistry,
} from './routeTagging';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', middleware: [] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'GET', path: '/products', middleware: [] },
];

beforeEach(() => {
  clearTagRegistry();
});

describe('setTagsForRoute / getTagsForRoute', () => {
  it('should store and retrieve tags for a route', () => {
    setTagsForRoute('GET', '/users', ['users', 'public']);
    expect(getTagsForRoute('GET', '/users')).toEqual(['users', 'public']);
  });

  it('should return empty array for unregistered route', () => {
    expect(getTagsForRoute('DELETE', '/unknown')).toEqual([]);
  });

  it('should deduplicate tags on set', () => {
    setTagsForRoute('GET', '/users', ['users', 'users', 'public']);
    expect(getTagsForRoute('GET', '/users')).toEqual(['users', 'public']);
  });

  it('should be case-insensitive for method', () => {
    setTagsForRoute('get', '/users', ['admin']);
    expect(getTagsForRoute('GET', '/users')).toEqual(['admin']);
  });
});

describe('applyTags', () => {
  it('should annotate routes with their registered tags', () => {
    setTagsForRoute('GET', '/users', ['users']);
    setTagsForRoute('POST', '/users', ['users', 'write']);
    const result = applyTags(sampleRoutes);
    expect(result[0].tags).toEqual(['users']);
    expect(result[1].tags).toEqual(['users', 'write']);
    expect(result[2].tags).toEqual([]);
  });
});

describe('groupRoutesByTag', () => {
  it('should group routes by tag', () => {
    const tagged: RouteInfo[] = [
      { method: 'GET', path: '/users', middleware: [], tags: ['users'] },
      { method: 'POST', path: '/users', middleware: [], tags: ['users', 'write'] },
      { method: 'GET', path: '/products', middleware: [], tags: ['products'] },
    ];
    const groups = groupRoutesByTag(tagged);
    expect(groups['users']).toHaveLength(2);
    expect(groups['write']).toHaveLength(1);
    expect(groups['products']).toHaveLength(1);
  });

  it('should place untagged routes under "untagged" key', () => {
    const groups = groupRoutesByTag(sampleRoutes);
    expect(groups['untagged']).toHaveLength(3);
  });
});
