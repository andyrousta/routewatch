import express, { Router } from 'express';
import {
  extractMiddlewareNames,
  detectMiddlewareForRoute,
} from './routeMiddlewareDetector';

function namedMiddleware(req: unknown, res: unknown, next: Function) {
  next();
}

describe('extractMiddlewareNames', () => {
  it('should extract the name of a named function', () => {
    const layer = { handle: namedMiddleware };
    const result = extractMiddlewareNames(layer as Record<string, unknown>);
    expect(result).toEqual([{ name: 'namedMiddleware', type: 'named' }]);
  });

  it('should label anonymous functions correctly', () => {
    const layer = { handle: function () {} };
    const result = extractMiddlewareNames(layer as Record<string, unknown>);
    expect(result[0].type).toBe('anonymous');
  });

  it('should return empty array when no handle present', () => {
    const result = extractMiddlewareNames({});
    expect(result).toEqual([]);
  });
});

describe('detectMiddlewareForRoute', () => {
  let router: Router;

  beforeEach(() => {
    router = express.Router();
  });

  it('should detect named middleware on a specific route', () => {
    router.get('/test', namedMiddleware, (req, res) => res.send('ok'));
    const result = detectMiddlewareForRoute(router, '/test', 'GET');
    expect(result.some((m) => m.name === 'namedMiddleware')).toBe(true);
  });

  it('should return empty array for unmatched path', () => {
    router.get('/other', namedMiddleware, (req, res) => res.send('ok'));
    const result = detectMiddlewareForRoute(router, '/test', 'GET');
    expect(result).toEqual([]);
  });

  it('should return empty array for router with no stack', () => {
    const emptyRouter = {} as Router;
    const result = detectMiddlewareForRoute(emptyRouter, '/test', 'GET');
    expect(result).toEqual([]);
  });
});
