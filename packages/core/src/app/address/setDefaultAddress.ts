import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import AddressType from './AddressType';
import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
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
        ? B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY
        : B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY;

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
                B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, defaultAddress.id);
            }
        } catch {
            /* Do nothing: we should not block shoppers from buying. */
        }

        return;
    }

    const storedAddressId = B2BExtraFieldsSessionStorage.getAddressId(addressIdKey);
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
        B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, matchedAddress.id);
    } else {
        B2BExtraFieldsSessionStorage.removeAddressId(addressIdKey);
    }
}
