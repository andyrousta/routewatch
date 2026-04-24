import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exportRoutes, renderContent, getDefaultOutputPath } from './routeExporter';
import { RouteInfo } from './types';

const sampleRoutes: RouteInfo[] = [
  { method: 'GET', path: '/users', params: [] },
  { method: 'POST', path: '/users', params: [] },
  { method: 'GET', path: '/users/:id', params: ['id'] },
];

describe('renderContent', () => {
  it('renders valid JSON content', () => {
    const result = renderContent(sampleRoutes, 'json', true);
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(3);
  });

  it('renders markdown content with table header', () => {
    const result = renderContent(sampleRoutes, 'markdown');
    expect(result).toContain('| Method |');
    expect(result).toContain('GET');
  });

  it('renders summary content', () => {
    const result = renderContent(sampleRoutes, 'summary');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('throws on unsupported format', () => {
    expect(() => renderContent(sampleRoutes, 'xml' as any)).toThrow(
      'Unsupported export format: xml'
    );
  });
});

describe('exportRoutes', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routeexporter-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes JSON file to disk', () => {
    const outputPath = path.join(tmpDir, 'routes.json');
    exportRoutes(sampleRoutes, { format: 'json', outputPath });
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    expect(content).toHaveLength(3);
  });

  it('creates nested directories if they do not exist', () => {
    const outputPath = path.join(tmpDir, 'nested', 'deep', 'routes.md');
    exportRoutes(sampleRoutes, { format: 'markdown', outputPath });
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});

describe('getDefaultOutputPath', () => {
  it('returns correct filename for json format', () => {
    expect(getDefaultOutputPath('json', './docs')).toBe(path.join('./docs', 'routes.json'));
  });

  it('returns correct filename for markdown format', () => {
    expect(getDefaultOutputPath('markdown')).toBe(path.join('.', 'routes.md'));
  });

  it('returns correct filename for summary format', () => {
    expect(getDefaultOutputPath('summary')).toBe(path.join('.', 'routes-summary.txt'));
  });
});
