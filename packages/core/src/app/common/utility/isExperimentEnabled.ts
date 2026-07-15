import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isExperimentEnabled(
    checkoutSettings: CheckoutSettings | undefined,
    experimentName: string,
    fallbackValue = true,
): boolean {
    return checkoutSettings?.features[experimentName] ?? fallbackValue;
}
