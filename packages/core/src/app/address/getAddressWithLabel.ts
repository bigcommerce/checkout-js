import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import isEqualAddress from './isEqualAddress';

export default function getAddressWithLabel<T extends Address>(
    address: T,
    customerAddresses: CustomerAddress[] = [],
): T {
    if (address.label) {
        return address;
    }

    const match = customerAddresses.find((customerAddress) =>
        isEqualAddress(address, customerAddress),
    );

    return match?.label ? { ...address, label: match.label } : address;
}
