import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import AddressType from './AddressType';
import isEqualAddress from './isEqualAddress';

interface SetDefaultAddressOptions {
    type: AddressType;
    currentAddress?: Address;
    addresses?: CustomerAddress[];
    updateAddress(address: Address): Promise<unknown>;
}

export default async function setDefaultAddress({
    type,
    currentAddress,
    addresses,
    updateAddress,
}: SetDefaultAddressOptions): Promise<void> {
    const isShipping = type === AddressType.Shipping;
    const addressIdKey = isShipping
        ? B2BSessionStorage.shippingAddressIdKey
        : B2BSessionStorage.billingAddressIdKey;

    const filteredAddresses = addresses?.filter((address) =>
        isShipping ? address.isShipping : address.isBilling,
    );
    const defaultAddress = filteredAddresses?.find((address) =>
        isShipping ? address.isDefaultShipping : address.isDefaultBilling,
    );

    if (!currentAddress?.address1) {
        if (!defaultAddress) {
            return;
        }

        try {
            await updateAddress(defaultAddress);

            if (defaultAddress.id) {
                B2BSessionStorage.set(addressIdKey, defaultAddress.id);
            }
        } catch {
            /* Do nothing: we should not block shoppers from buying. */
        }

        return;
    }

    const storedAddressId = B2BSessionStorage.getAddressId(addressIdKey);
    const storedIdStillMatches = filteredAddresses?.some(
        (address) => address.id === storedAddressId && isEqualAddress(address, currentAddress),
    );

    if (storedAddressId && storedIdStillMatches) {
        return;
    }

    // Pre-existing address (e.g. resumed checkout): recover its book ID by matching,
    // or clear a stale ID when the address no longer corresponds to a book entry.
    const matchedAddress = filteredAddresses?.find((address) =>
        isEqualAddress(address, currentAddress),
    );

    if (matchedAddress?.id) {
        B2BSessionStorage.set(addressIdKey, matchedAddress.id);
    } else {
        B2BSessionStorage.remove(addressIdKey);
    }
}
