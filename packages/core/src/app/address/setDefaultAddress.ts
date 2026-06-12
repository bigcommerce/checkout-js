import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
import isEqualAddress from './isEqualAddress';

interface SetDefaultAddressOptions {
    addressIdKey: string;
    currentAddress?: Address;
    addresses?: CustomerAddress[];
    defaultAddress?: CustomerAddress;
    updateAddress(address: Address): Promise<unknown>;
}

export default async function setDefaultAddress({
    addressIdKey,
    currentAddress,
    addresses,
    defaultAddress,
    updateAddress,
}: SetDefaultAddressOptions): Promise<void> {
    if (!currentAddress?.address1) {
        if (!defaultAddress) {
            return;
        }

        try {
            await updateAddress(defaultAddress);

            if (defaultAddress.id) {
                B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, defaultAddress.id);
            }
        } catch {
            /* Do nothing: we should not block shoppers from buying. */
        }

        return;
    }

    const storedAddressId = B2BExtraFieldsSessionStorage.getAddressId(addressIdKey);
    const storedIdStillMatches = addresses?.some(
        (address) => address.id === storedAddressId && isEqualAddress(address, currentAddress),
    );

    if (storedAddressId && storedIdStillMatches) {
        return;
    }

    // Pre-existing address (e.g. resumed checkout): recover its book ID by matching.
    const matchedAddress = addresses?.find((address) => isEqualAddress(address, currentAddress));

    if (matchedAddress?.id) {
        B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, matchedAddress.id);
    }
}
