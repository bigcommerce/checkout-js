import { type StoreConfig } from '@bigcommerce/checkout-sdk';

import { assignLocation } from '@bigcommerce/checkout/dom-utils';

export function attemptStorefrontLoginRedirect(config?: StoreConfig): boolean {
    if (!config?.checkoutSettings.shouldRedirectToStorefrontForAuth) {
        return false;
    }

    assignLocation(`${config.links.loginLink}?redirectTo=${config.links.checkoutLink}`);

    return true;
}
