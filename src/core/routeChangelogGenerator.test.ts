import {
  recordChangelogEntry,
  getChangelog,
  clearChangelog,
  renderChangelogMarkdown,
} from './routeChangelogGenerator';
import { RouteInfo } from './types';

const routeA: RouteInfo = { method: 'get', path: '/users' };
const routeB: RouteInfo = { method: 'post', path: '/users' };
const routeC: RouteInfo = { method: 'delete', path: '/users/:id' };

beforeEach(() => {
  clearChangelog();
});

describe('recordChangelogEntry', () => {
  it('returns null when no changes detected', () => {
    const result = recordChangelogEntry([routeA], [routeA]);
    expect(result).toBeNull();
  });

  it('records added routes', () => {
    const entry = recordChangelogEntry([routeA], [routeA, routeB]);
    expect(entry).not.toBeNull();
    expect(entry!.added).toHaveLength(1);
    expect(entry!.added[0].path).toBe('/users');
    expect(entry!.added[0].method).toBe('post');
    expect(entry!.removed).toHaveLength(0);
  });

  it('records removed routes', () => {
    const entry = recordChangelogEntry([routeA, routeB], [routeA]);
    expect(entry).not.toBeNull();
    expect(entry!.removed).toHaveLength(1);
    expect(entry!.removed[0].method).toBe('post');
  });

  it('stores version when provided', () => {
    const entry = recordChangelogEntry([], [routeA], 'v1.2.0');
    expect(entry!.version).toBe('v1.2.0');
  });

  it('accumulates multiple entries', () => {
    recordChangelogEntry([], [routeA]);
    recordChangelogEntry([routeA], [routeA, routeC]);
    expect(getChangelog().entries).toHaveLength(2);
  });
});

describe('getChangelog', () => {
  it('returns empty entries when no changes recorded', () => {
    const log = getChangelog();
    expect(log.entries).toHaveLength(0);
    expect(log.generated).toBeTruthy();
  });
});

describe('renderChangelogMarkdown', () => {
  it('renders placeholder when no entries', () => {
    const md = renderChangelogMarkdown(getChangelog());
    expect(md).toContain('No changes recorded');
  });

  it('renders added and removed sections', () => {
    recordChangelogEntry([routeA], [routeB, routeC], 'v2.0.0');
    const md = renderChangelogMarkdown(getChangelog());
    expect(md).toContain('## v2.0.0');
    expect(md).toContain('### Added');
    expect(md).toContain('### Removed');
    expect(md).toContain('`POST /users`');
    expect(md).toContain('`GET /users`');
  });
});
