import { RouteInfo } from './types';
import { formatDiffSummary } from './routeComparator';
import { log } from './routeLogger';

export type NotifierChannel = 'console' | 'webhook' | 'callback';

export interface NotifierOptions {
  channel: NotifierChannel;
  webhookUrl?: string;
  onNotify?: (summary: string, added: RouteInfo[], removed: RouteInfo[]) => void;
}

let notifierOptions: NotifierOptions = { channel: 'console' };

export function configureNotifier(options: NotifierOptions): void {
  notifierOptions = { ...options };
}

export function getNotifierOptions(): NotifierOptions {
  return { ...notifierOptions };
}

export async function notifyRouteChanges(
  added: RouteInfo[],
  removed: RouteInfo[]
): Promise<void> {
  if (added.length === 0 && removed.length === 0) return;

  const summary = formatDiffSummary({ added, removed, unchanged: [] });

  switch (notifierOptions.channel) {
    case 'console':
      log('info', `[RouteWatch] Route changes detected:\n${summary}`);
      break;

    case 'webhook':
      if (!notifierOptions.webhookUrl) {
        log('warn', '[RouteWatch] Webhook channel configured but no webhookUrl provided.');
        return;
      }
      await sendWebhookNotification(notifierOptions.webhookUrl, summary, added, removed);
      break;

    case 'callback':
      if (typeof notifierOptions.onNotify === 'function') {
        notifierOptions.onNotify(summary, added, removed);
      } else {
        log('warn', '[RouteWatch] Callback channel configured but no onNotify function provided.');
      }
      break;

    default:
      log('warn', `[RouteWatch] Unknown notifier channel: ${(notifierOptions as any).channel}`);
  }
}

async function sendWebhookNotification(
  url: string,
  summary: string,
  added: RouteInfo[],
  removed: RouteInfo[]
): Promise<void> {
  try {
    const payload = JSON.stringify({ summary, added, removed, timestamp: new Date().toISOString() });
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (!response.ok) {
      log('warn', `[RouteWatch] Webhook notification failed with status ${response.status}`);
    }
  } catch (err) {
    log('warn', `[RouteWatch] Webhook notification error: ${(err as Error).message}`);
  }
}

export function resetNotifier(): void {
  notifierOptions = { channel: 'console' };
}
