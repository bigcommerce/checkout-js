import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isFloatingLabelEnabled(checkoutSettings: CheckoutSettings): boolean {
    return Boolean(checkoutSettings.checkoutUserExperienceSettings.floatingLabelEnabled);
}
