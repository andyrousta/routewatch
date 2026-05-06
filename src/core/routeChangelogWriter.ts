import * as path from 'path';
import { Changelog, renderChangelogMarkdown } from './routeChangelogGenerator';
import { ensureDirectoryExists } from './outputWriter';
import * as fs from 'fs';

export type ChangelogFormat = 'markdown' | 'json';

export interface ChangelogWriterOptions {
  outputDir: string;
  format?: ChangelogFormat;
  filename?: string;
}

export function getChangelogOutputPath(options: ChangelogWriterOptions): string {
  const format = options.format ?? 'markdown';
  const defaultName = format === 'json' ? 'CHANGELOG.json' : 'CHANGELOG.md';
  const filename = options.filename ?? defaultName;
  return path.join(options.outputDir, filename);
}

export function serializeChangelog(changelog: Changelog, format: ChangelogFormat): string {
  if (format === 'json') {
    return JSON.stringify(changelog, null, 2);
  }
  return renderChangelogMarkdown(changelog);
}

export function writeChangelog(
  changelog: Changelog,
  options: ChangelogWriterOptions
): string {
  const format = options.format ?? 'markdown';
  const outputPath = getChangelogOutputPath(options);
  ensureDirectoryExists(options.outputDir);
  const content = serializeChangelog(changelog, format);
  fs.writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}

export function readChangelog(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}
