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
        isConsistentCrossOriginFixEnabled?: boolean;
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

    const isConsistentCrossOriginFixEnabled = Boolean(
        window.checkoutConfig.isConsistentCrossOriginFixEnabled,
    );

    const bootstrap = async (customCheckoutWindow: CustomCheckoutWindow): Promise<void> => {
        const { renderOrderConfirmation, renderCheckout } = await loadFiles({
            isConsistentCrossOriginFixEnabled,
        });

        const {
            orderId,
            checkoutId,
            isConsistentCrossOriginFixEnabled: _isConsistentCrossOriginFixEnabled,
            ...appProps
        } = customCheckoutWindow.checkoutConfig;

        if (orderId) {
            renderOrderConfirmation({ ...appProps, orderId });
        } else if (checkoutId) {
            renderCheckout({ ...appProps, checkoutId });
        }
    };

    if (!isConsistentCrossOriginFixEnabled) {
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
