import * as fs from 'fs';
import * as path from 'path';

export interface WriteOptions {
  outputDir?: string;
  filename?: string;
  format?: 'markdown' | 'json';
}

const DEFAULT_OPTIONS: Required<WriteOptions> = {
  outputDir: './docs',
  filename: 'api-routes',
  format: 'markdown',
};

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function writeDocumentation(
  content: string,
  options: WriteOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const ext = opts.format === 'json' ? 'json' : 'md';
  const filePath = path.join(opts.outputDir, `${opts.filename}.${ext}`);

  ensureDirectoryExists(opts.outputDir);
  fs.writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

export function readDocumentation(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function hasDocumentationChanged(
  newContent: string,
  filePath: string
): boolean {
  const existing = readDocumentation(filePath);
  return existing !== newContent;
}

export function writeIfChanged(
  content: string,
  options: WriteOptions = {}
): { written: boolean; filePath: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const ext = opts.format === 'json' ? 'json' : 'md';
  const filePath = path.join(opts.outputDir, `${opts.filename}.${ext}`);

  if (hasDocumentationChanged(content, filePath)) {
    writeDocumentation(content, options);
    return { written: true, filePath };
  }

  return { written: false, filePath };
}
