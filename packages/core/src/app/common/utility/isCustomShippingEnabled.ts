import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

export default function isCustomShippingEnabled(
    checkoutSettings: CheckoutSettings | undefined,
): boolean {
    return Boolean(
        checkoutSettings?.features['PROJECT-5015.manual_order.display_custom_shipping'] ?? true,
    );
}
