import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import isEqualAddress from './isEqualAddress';

/**
 * `updateBillingAddress` / `updateShippingAddress` don't round-trip B2B
 * `extraFields` through the checkout state. Look up the matching customer
 * address book entry and graft its `extraFields` onto the current address so
 * the form and validation see the values. No-op for B2C
 * (`hasAddressExtraFields=false`) and when the address already carries its
 * own `extraFields`.
 */
export default function getAddressWithCustomerExtraFields<T extends Address>(
    address: T | undefined,
    customerAddresses: CustomerAddress[] | undefined,
    hasAddressExtraFields: boolean,
): T | undefined {
    if (!hasAddressExtraFields || !address) {
        return address;
    }

    if (address.extraFields?.length) {
        return address;
    }

    const match = customerAddresses?.find((customerAddress) =>
        isEqualAddress(customerAddress, address),
    );

    return match?.extraFields?.length ? { ...address, extraFields: match.extraFields } : address;
}
