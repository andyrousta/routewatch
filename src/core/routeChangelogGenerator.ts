import { RouteInfo } from './types';
import { compareRoutes, formatDiffSummary } from './routeComparator';

export interface ChangelogEntry {
  timestamp: string;
  version?: string;
  added: RouteInfo[];
  removed: RouteInfo[];
  summary: string;
}

export interface Changelog {
  generated: string;
  entries: ChangelogEntry[];
}

let changelogHistory: ChangelogEntry[] = [];

export function recordChangelogEntry(
  previous: RouteInfo[],
  current: RouteInfo[],
  version?: string
): ChangelogEntry | null {
  const diff = compareRoutes(previous, current);
  if (diff.added.length === 0 && diff.removed.length === 0) {
    return null;
  }
  const entry: ChangelogEntry = {
    timestamp: new Date().toISOString(),
    version,
    added: diff.added,
    removed: diff.removed,
    summary: formatDiffSummary(diff),
  };
  changelogHistory.push(entry);
  return entry;
}

export function getChangelog(): Changelog {
  return {
    generated: new Date().toISOString(),
    entries: [...changelogHistory],
  };
}

export function clearChangelog(): void {
  changelogHistory = [];
}

export function renderChangelogMarkdown(changelog: Changelog): string {
  const lines: string[] = ['# Route Changelog', ''];
  if (changelog.entries.length === 0) {
    lines.push('_No changes recorded._');
    return lines.join('\n');
  }
  for (const entry of changelog.entries) {
    const label = entry.version ? `${entry.version} — ${entry.timestamp}` : entry.timestamp;
    lines.push(`## ${label}`, '');
    if (entry.added.length > 0) {
      lines.push('### Added', '');
      for (const r of entry.added) lines.push(`- \`${r.method.toUpperCase()} ${r.path}\``);
      lines.push('');
    }
    if (entry.removed.length > 0) {
      lines.push('### Removed', '');
      for (const r of entry.removed) lines.push(`- \`${r.method.toUpperCase()} ${r.path}\``);
      lines.push('');
    }
  }
  return lines.join('\n');
}
