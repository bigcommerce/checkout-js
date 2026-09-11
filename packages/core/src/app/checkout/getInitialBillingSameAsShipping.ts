import { type Address, type BillingAddress } from '@bigcommerce/checkout-sdk/essential';

import { isEmptyAddress, isEqualAddress } from '../address';

interface GetInitialBillingSameAsShippingOptions {
    billingAddress?: BillingAddress;
    shippingAddress?: Address;
    defaultValue: boolean;
}

// Seed from the persisted addresses when they exist; fresh checkouts fall back to the store setting.
export function getInitialBillingSameAsShipping({
    billingAddress,
    shippingAddress,
    defaultValue,
}: GetInitialBillingSameAsShippingOptions): boolean {
    if (!shippingAddress || isEmptyAddress(billingAddress)) {
        return defaultValue;
    }

    return isEqualAddress(billingAddress, shippingAddress);
}
