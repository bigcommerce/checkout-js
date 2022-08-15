import { BrowserOptions } from '@sentry/browser';

import { loadFiles } from './loader';

export interface CustomCheckoutWindow extends Window {
    checkoutConfig: {
        containerId: string;
        orderId?: number;
        checkoutId?: string;
        publicPath?: string;
        sentryConfig?: BrowserOptions;
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

    const { renderOrderConfirmation, renderCheckout } = await loadFiles();

    const { orderId, checkoutId, ...appProps } = window.checkoutConfig;

    if (orderId) {
        renderOrderConfirmation({ ...appProps, orderId });
    } else if (checkoutId) {
        renderCheckout({ ...appProps, checkoutId });
    }
})();
