import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  getChangelogOutputPath,
  serializeChangelog,
  writeChangelog,
  readChangelog,
} from './routeChangelogWriter';
import { Changelog } from './routeChangelogGenerator';

const sampleChangelog: Changelog = {
  generated: '2024-01-01T00:00:00.000Z',
  entries: [
    {
      timestamp: '2024-01-01T00:00:00.000Z',
      version: 'v1.0.0',
      added: [{ method: 'get', path: '/health' }],
      removed: [],
      summary: '+1 added, 0 removed',
    },
  ],
};

describe('getChangelogOutputPath', () => {
  it('defaults to markdown filename', () => {
    const p = getChangelogOutputPath({ outputDir: '/docs' });
    expect(p).toBe('/docs/CHANGELOG.md');
  });

  it('uses json filename for json format', () => {
    const p = getChangelogOutputPath({ outputDir: '/docs', format: 'json' });
    expect(p).toBe('/docs/CHANGELOG.json');
  });

  it('respects custom filename', () => {
    const p = getChangelogOutputPath({ outputDir: '/docs', filename: 'history.md' });
    expect(p).toBe('/docs/history.md');
  });
});

describe('serializeChangelog', () => {
  it('serializes to JSON', () => {
    const result = serializeChangelog(sampleChangelog, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].version).toBe('v1.0.0');
  });

  it('serializes to markdown', () => {
    const result = serializeChangelog(sampleChangelog, 'markdown');
    expect(result).toContain('# Route Changelog');
    expect(result).toContain('v1.0.0');
  });
});

describe('writeChangelog / readChangelog', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-changelog-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes markdown changelog to disk', () => {
    const outputPath = writeChangelog(sampleChangelog, { outputDir: tmpDir });
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain('# Route Changelog');
  });

  it('writes json changelog to disk', () => {
    const outputPath = writeChangelog(sampleChangelog, { outputDir: tmpDir, format: 'json' });
    const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    expect(parsed.entries[0].version).toBe('v1.0.0');
  });

  it('readChangelog returns null for missing file', () => {
    expect(readChangelog(path.join(tmpDir, 'missing.md'))).toBeNull();
  });

  it('readChangelog returns content for existing file', () => {
    const outputPath = writeChangelog(sampleChangelog, { outputDir: tmpDir });
    const content = readChangelog(outputPath);
    expect(content).toContain('Route Changelog');
  });
});
