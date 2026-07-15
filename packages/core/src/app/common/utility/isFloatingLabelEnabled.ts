import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isFloatingLabelEnabled(checkoutSettings: CheckoutSettings): boolean {
    return checkoutSettings.checkoutUserExperienceSettings.floatingLabelEnabled;
}
// ts6-flush
