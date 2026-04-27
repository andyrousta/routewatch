import {
  configureNotifier,
  getNotifierOptions,
  notifyRouteChanges,
  resetNotifier,
} from './routeChangeNotifier';
import { RouteInfo } from './types';

const mockRoute = (method: string, path: string): RouteInfo => ({ method, path });

describe('routeChangeNotifier', () => {
  beforeEach(() => {
    resetNotifier();
  });

  it('defaults to console channel', () => {
    expect(getNotifierOptions().channel).toBe('console');
  });

  it('configureNotifier updates options', () => {
    configureNotifier({ channel: 'callback', onNotify: jest.fn() });
    expect(getNotifierOptions().channel).toBe('callback');
  });

  it('does nothing when no changes', async () => {
    const onNotify = jest.fn();
    configureNotifier({ channel: 'callback', onNotify });
    await notifyRouteChanges([], []);
    expect(onNotify).not.toHaveBeenCalled();
  });

  it('calls onNotify callback with added routes', async () => {
    const onNotify = jest.fn();
    configureNotifier({ channel: 'callback', onNotify });
    const added = [mockRoute('GET', '/api/users')];
    await notifyRouteChanges(added, []);
    expect(onNotify).toHaveBeenCalledTimes(1);
    expect(onNotify).toHaveBeenCalledWith(expect.any(String), added, []);
  });

  it('calls onNotify callback with removed routes', async () => {
    const onNotify = jest.fn();
    configureNotifier({ channel: 'callback', onNotify });
    const removed = [mockRoute('DELETE', '/api/posts')];
    await notifyRouteChanges([], removed);
    expect(onNotify).toHaveBeenCalledWith(expect.any(String), [], removed);
  });

  it('warns when callback channel has no onNotify', async () => {
    configureNotifier({ channel: 'callback' });
    await expect(notifyRouteChanges([mockRoute('GET', '/x')], [])).resolves.not.toThrow();
  });

  it('warns when webhook channel has no url', async () => {
    configureNotifier({ channel: 'webhook' });
    await expect(notifyRouteChanges([mockRoute('POST', '/y')], [])).resolves.not.toThrow();
  });

  it('resetNotifier restores defaults', () => {
    configureNotifier({ channel: 'webhook', webhookUrl: 'http://example.com' });
    resetNotifier();
    expect(getNotifierOptions()).toEqual({ channel: 'console' });
  });

  it('summary string is passed to callback', async () => {
    const onNotify = jest.fn();
    configureNotifier({ channel: 'callback', onNotify });
    await notifyRouteChanges([mockRoute('GET', '/api/v1/items')], [mockRoute('GET', '/api/v1/old')]);
    const [summary] = onNotify.mock.calls[0];
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
});
