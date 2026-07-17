import type { BrowserOptions } from '@sentry/browser';

import { loadFiles } from './loader';

enum OrderPermalinkStatus {
    Valid = 'valid',
    Expired = 'expired',
    RateLimited = 'rate_limited',
}

export interface CustomCheckoutWindow extends Window {
    checkoutConfig: {
        containerId: string;
        orderId?: number;
        checkoutId?: string;
        publicPath?: string;
        sentryConfig?: BrowserOptions;
        permalinkStatus?: OrderPermalinkStatus | null;
        isSafePrefetchEnabled?: boolean;
    };
}

function isCustomCheckoutWindow(window: Window): window is CustomCheckoutWindow {
    const customCheckoutWindow: CustomCheckoutWindow = window as CustomCheckoutWindow;

    return !!customCheckoutWindow.checkoutConfig;
}

(async function autoLoad() {
    if (!isCustomCheckoutWindow(window)) {
        throw new Error('Checkout config is missing.');
    }

    const isSafePrefetchEnabled = Boolean(window.checkoutConfig.isSafePrefetchEnabled);

    const bootstrap = async (customCheckoutWindow: CustomCheckoutWindow): Promise<void> => {
        const { renderOrderConfirmation, renderCheckout } = await loadFiles({
            isSafePrefetchEnabled,
        });

        const {
            orderId,
            checkoutId,
            isSafePrefetchEnabled: _isSafePrefetchEnabled,
            ...appProps
        } = customCheckoutWindow.checkoutConfig;

        if (orderId) {
            renderOrderConfirmation({ ...appProps, orderId });
        } else if (checkoutId) {
            renderCheckout({ ...appProps, checkoutId });
        }
    };

    // Gated behind the same flag as the crossorigin/SRI prefetch fix: existing stores
    // (flag off) get the exact same fire-and-forget bootstrap as before this diagnostics
    // work existed -- a failure is a silent unhandled rejection, same as always. Only
    // flag-on stores get it caught and logged.
    if (!isSafePrefetchEnabled) {
        await bootstrap(window);

        return;
    }

    try {
        await bootstrap(window);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[checkout-js] Checkout failed to bootstrap:', error);
    }
})();
