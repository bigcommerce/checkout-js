import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isExperimentEnabled(
    checkoutSettings: CheckoutSettings | undefined,
    experimentName: string,
    fallbackValue = true
): boolean {
    if (experimentName === 'CHECKOUT-9768.form_fields_max_length_validation') {
        console.log(checkoutSettings?.features[experimentName]);
    }
    return Boolean(checkoutSettings?.features[experimentName] ?? fallbackValue);
}
