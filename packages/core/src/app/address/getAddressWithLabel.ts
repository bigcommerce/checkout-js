import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import isEqualAddress from './isEqualAddress';

export default function getAddressWithLabel<T extends Address>(
    address: T,
    customerAddresses: CustomerAddress[] = [],
): T {
    if (address.label) {
        return address;
    }

    // We match only against the locally loaded `customerAddresses`, not the
    // full server-side company address book. A company may have many more
    // addresses on the server than are returned here, so an address selected
    // from the full book may not appear in this subset and will render without
    // a label. We accept that gap rather than round-tripping to the API to
    // resolve a purely cosmetic label.
    const match = customerAddresses.find((customerAddress) =>
        isEqualAddress(address, customerAddress),
    );

    return match?.label ? { ...address, label: match.label } : address;
}
