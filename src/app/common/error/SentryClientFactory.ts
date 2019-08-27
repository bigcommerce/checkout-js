import { BrowserClient, BrowserOptions, Hub } from '@sentry/browser';

export default class SentryClientFactory {
    createClient(options?: BrowserOptions): BrowserClient {
        return new BrowserClient(options);
    }

    createHub(client: BrowserClient): Hub {
        return new Hub(client);
    }
}
