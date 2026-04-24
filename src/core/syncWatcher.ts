import * as fs from 'fs';
import * as path from 'path';
import { generateDoc } from './docGenerator';
import { extractRoutes } from './routeExtractor';

export interface WatcherOptions {
  outputPath?: string;
  format?: 'markdown' | 'json';
  debounceMs?: number;
}

const DEFAULT_OPTIONS: Required<WatcherOptions> = {
  outputPath: './API_DOCS.md',
  format: 'markdown',
  debounceMs: 300,
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startWatcher(
  app: any,
  watchDir: string,
  options: WatcherOptions = {}
): fs.FSWatcher {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const writeDoc = () => {
    try {
      const routes = extractRoutes(app);
      const doc = generateDoc(routes, opts.format);
      const outputDir = path.dirname(opts.outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(opts.outputPath, doc, 'utf-8');
      console.log(`[routewatch] Docs updated at ${opts.outputPath}`);
    } catch (err) {
      console.error('[routewatch] Failed to update docs:', err);
    }
  };

  const debouncedWrite = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(writeDoc, opts.debounceMs);
  };

  writeDoc();

  const watcher = fs.watch(watchDir, { recursive: true }, (event, filename) => {
    if (filename && /\.(ts|js)$/.test(filename)) {
      console.log(`[routewatch] Change detected in ${filename}, regenerating docs...`);
      debouncedWrite();
    }
  });

  return watcher;
}

export function stopWatcher(watcher: fs.FSWatcher): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  watcher.close();
  console.log('[routewatch] Watcher stopped.');
}
