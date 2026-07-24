import { type StoreConfig } from '@bigcommerce/checkout-sdk';

export default function attemptStorefrontLoginRedirect(config?: StoreConfig): boolean {
    if (!config?.checkoutSettings.shouldRedirectToStorefrontForAuth) {
        return false;
    }

    window.location.assign(`${config.links.loginLink}?redirectTo=${config.links.checkoutLink}`);

    return true;
}
