import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

export function isCheckoutExtensionEnabled(
    checkoutSettings: CheckoutSettings | undefined,
): boolean {
    return Boolean(checkoutSettings?.features['PROJECT-5029.checkout_extension']);
}
