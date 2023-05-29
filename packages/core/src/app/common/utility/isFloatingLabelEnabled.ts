import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isFloatingLabelEnabled(checkoutSettings: CheckoutSettings): boolean {
    // @ts-ignore
    return Boolean(checkoutSettings.checkoutUserExperienceSettings.floatingLabelEnabled);
}
