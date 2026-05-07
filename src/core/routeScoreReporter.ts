import { RouteInfo } from './types';
import { computeScore, RouteScore, ScoreCategory } from './routeScoreAnnotator';

export interface RouteScoreEntry {
  method: string;
  path: string;
  score: RouteScore;
  grade: string;
}

export interface ScoreReport {
  entries: RouteScoreEntry[];
  averageTotal: number;
  lowestScored: RouteScoreEntry | null;
  highestScored: RouteScoreEntry | null;
}

function gradeFromScore(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 50) return 'C';
  if (total >= 25) return 'D';
  return 'F';
}

export function buildScoreReport(routes: RouteInfo[]): ScoreReport {
  const entries: RouteScoreEntry[] = routes.map((route) => {
    const score = (route as any).score ?? computeScore(route);
    return { method: route.method, path: route.path, score, grade: gradeFromScore(score.total) };
  });

  const averageTotal = entries.length
    ? Math.round(entries.reduce((sum, e) => sum + e.score.total, 0) / entries.length)
    : 0;

  const sorted = [...entries].sort((a, b) => a.score.total - b.score.total);
  return {
    entries,
    averageTotal,
    lowestScored: sorted[0] ?? null,
    highestScored: sorted[sorted.length - 1] ?? null,
  };
}

export function formatScoreReport(report: ScoreReport): string {
  const lines: string[] = ['# Route Score Report', ''];
  lines.push(`**Average Score:** ${report.averageTotal}/100`, '');
  lines.push('| Method | Path | Score | Grade |');
  lines.push('|--------|------|-------|-------|');
  for (const entry of report.entries) {
    lines.push(`| ${entry.method} | ${entry.path} | ${entry.score.total} | ${entry.grade} |`);
  }
  if (report.lowestScored) {
    lines.push('', `**Lowest:** ${report.lowestScored.method} ${report.lowestScored.path} (${report.lowestScored.score.total})`);
  }
  if (report.highestScored) {
    lines.push(`**Highest:** ${report.highestScored.method} ${report.highestScored.path} (${report.highestScored.score.total})`);
  }
  return lines.join('\n');
}

export function generateScoreReport(routes: RouteInfo[]): string {
  return formatScoreReport(buildScoreReport(routes));
}
