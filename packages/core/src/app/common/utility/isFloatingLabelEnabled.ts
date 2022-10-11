import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isFloatingLabelEnabled(checkoutSettings: CheckoutSettings): boolean {
    return !!checkoutSettings.features['CHECKOUT-6879.enable_floating_labels'];
}
