import {
  setParamAnnotations,
  getParamAnnotations,
  applyParamAnnotations,
  clearParamRegistry,
  getParamSummary,
  routeKey,
} from './routeParamAnnotator';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users/:id', middlewares: [] },
  { method: 'DELETE', path: '/posts/:postId/comments/:commentId', middlewares: [] },
  { method: 'POST', path: '/items', middlewares: [] },
];

beforeEach(() => {
  clearParamRegistry();
});

describe('routeKey', () => {
  it('should produce an uppercase method:path key', () => {
    expect(routeKey('get', '/users/:id')).toBe('GET:/users/:id');
  });
});

describe('setParamAnnotations / getParamAnnotations', () => {
  it('should store and retrieve param annotations', () => {
    setParamAnnotations('GET', '/users/:id', { id: { type: 'string', required: true } });
    const result = getParamAnnotations('GET', '/users/:id');
    expect(result).toEqual({ id: { type: 'string', required: true } });
  });

  it('should return undefined for unannotated routes', () => {
    expect(getParamAnnotations('GET', '/unknown')).toBeUndefined();
  });
});

describe('applyParamAnnotations', () => {
  it('should attach param annotations to matching routes', () => {
    setParamAnnotations('GET', '/users/:id', {
      id: { type: 'number', required: true, description: 'User ID' },
    });
    const result = applyParamAnnotations(sampleRoutes);
    expect((result[0] as any).params).toEqual({
      id: { type: 'number', required: true, description: 'User ID' },
    });
  });

  it('should not modify routes without annotations', () => {
    const result = applyParamAnnotations(sampleRoutes);
    expect((result[2] as any).params).toBeUndefined();
  });
});

describe('getParamSummary', () => {
  it('should return a formatted summary string', () => {
    setParamAnnotations('DELETE', '/posts/:postId/comments/:commentId', {
      postId: { type: 'string', required: true, description: 'Post ID' },
      commentId: { type: 'string', required: false },
    });
    const summary = getParamSummary('DELETE', '/posts/:postId/comments/:commentId');
    expect(summary).toContain(':postId');
    expect(summary).toContain('[required]');
    expect(summary).toContain(':commentId');
    expect(summary).toContain('[optional]');
  });

  it('should return fallback message when no annotations exist', () => {
    expect(getParamSummary('GET', '/nothing')).toBe('No path param annotations');
  });
});

describe('clearParamRegistry', () => {
  it('should remove all stored annotations', () => {
    setParamAnnotations('GET', '/users/:id', { id: { type: 'string' } });
    clearParamRegistry();
    expect(getParamAnnotations('GET', '/users/:id')).toBeUndefined();
  });
});
