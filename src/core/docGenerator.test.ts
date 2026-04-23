import { generateDoc, generateMarkdown, ApiDoc } from './docGenerator';
import { RouteInfo } from './routeExtractor';

const mockRoutes: RouteInfo[] = [
  { method: 'get', path: '/users' },
  { method: 'post', path: '/users' },
  { method: 'get', path: '/users/:id' },
  { method: 'delete', path: '/users/:id/posts/:postId' },
];

describe('generateDoc', () => {
  it('should generate a doc object with default title and version', () => {
    const doc = generateDoc(mockRoutes);
    expect(doc.title).toBe('API Documentation');
    expect(doc.version).toBe('1.0.0');
    expect(doc.routes).toHaveLength(4);
  });

  it('should respect custom title and version options', () => {
    const doc = generateDoc(mockRoutes, { title: 'My API', version: '2.0.0' });
    expect(doc.title).toBe('My API');
    expect(doc.version).toBe('2.0.0');
  });

  it('should uppercase HTTP methods', () => {
    const doc = generateDoc(mockRoutes);
    expect(doc.routes[0].method).toBe('GET');
    expect(doc.routes[1].method).toBe('POST');
  });

  it('should extract path params correctly', () => {
    const doc = generateDoc(mockRoutes);
    expect(doc.routes[2].params).toEqual(['id']);
    expect(doc.routes[3].params).toEqual(['id', 'postId']);
  });

  it('should set params to undefined for routes without params', () => {
    const doc = generateDoc(mockRoutes);
    expect(doc.routes[0].params).toBeUndefined();
  });

  it('should include a generatedAt timestamp', () => {
    const doc = generateDoc(mockRoutes);
    expect(typeof doc.generatedAt).toBe('string');
    expect(new Date(doc.generatedAt).toString()).not.toBe('Invalid Date');
  });
});

describe('generateMarkdown', () => {
  let doc: ApiDoc;

  beforeEach(() => {
    doc = generateDoc(mockRoutes, { title: 'Test API', version: '1.2.3' });
  });

  it('should include the title in the markdown output', () => {
    const md = generateMarkdown(doc);
    expect(md).toContain('# Test API');
  });

  it('should include route method and path', () => {
    const md = generateMarkdown(doc);
    expect(md).toContain('`GET /users`');
    expect(md).toContain('`DELETE /users/:id/posts/:postId`');
  });

  it('should list params for parameterized routes', () => {
    const md = generateMarkdown(doc);
    expect(md).toContain('`:id`');
    expect(md).toContain('`:postId`');
  });
});
