import * as fs from 'fs';
import * as path from 'path';
import {
  ensureDirectoryExists,
  writeDocumentation,
  readDocumentation,
  hasDocumentationChanged,
  writeIfChanged,
} from './outputWriter';

const TEST_DIR = './test-output-tmp';

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('ensureDirectoryExists', () => {
  it('should create directory if it does not exist', () => {
    const dir = path.join(TEST_DIR, 'nested/dir');
    ensureDirectoryExists(dir);
    expect(fs.existsSync(dir)).toBe(true);
  });

  it('should not throw if directory already exists', () => {
    ensureDirectoryExists(TEST_DIR);
    expect(() => ensureDirectoryExists(TEST_DIR)).not.toThrow();
  });
});

describe('writeDocumentation', () => {
  it('should write markdown file with default options', () => {
    const filePath = writeDocumentation('# API Docs', { outputDir: TEST_DIR });
    expect(fs.existsSync(filePath)).toBe(true);
    expect(filePath.endsWith('.md')).toBe(true);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('# API Docs');
  });

  it('should write json file when format is json', () => {
    const filePath = writeDocumentation('{"routes":[]}', {
      outputDir: TEST_DIR,
      format: 'json',
    });
    expect(filePath.endsWith('.json')).toBe(true);
  });

  it('should use custom filename', () => {
    const filePath = writeDocumentation('content', {
      outputDir: TEST_DIR,
      filename: 'custom-api',
    });
    expect(filePath).toContain('custom-api');
  });
});

describe('readDocumentation', () => {
  it('should return null if file does not exist', () => {
    expect(readDocumentation('./nonexistent/file.md')).toBeNull();
  });

  it('should return file content if file exists', () => {
    const filePath = writeDocumentation('hello world', { outputDir: TEST_DIR });
    expect(readDocumentation(filePath)).toBe('hello world');
  });
});

describe('writeIfChanged', () => {
  it('should write and return written=true when file does not exist', () => {
    const result = writeIfChanged('new content', { outputDir: TEST_DIR });
    expect(result.written).toBe(true);
    expect(fs.existsSync(result.filePath)).toBe(true);
  });

  it('should not write and return written=false when content is unchanged', () => {
    writeDocumentation('same content', { outputDir: TEST_DIR });
    const result = writeIfChanged('same content', { outputDir: TEST_DIR });
    expect(result.written).toBe(false);
  });

  it('should write and return written=true when content has changed', () => {
    writeDocumentation('old content', { outputDir: TEST_DIR });
    const result = writeIfChanged('new content', { outputDir: TEST_DIR });
    expect(result.written).toBe(true);
  });
});
