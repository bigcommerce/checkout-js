import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import AddressType from './AddressType';

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
    if (currentAddress?.address1) {
        return;
    }

    const isShipping = type === AddressType.Shipping;
    const defaultAddress = addresses
        ?.filter((address) => (isShipping ? address.b2b?.isShipping : address.b2b?.isBilling))
        .find((address) =>
            isShipping ? address.b2b?.isDefaultShipping : address.b2b?.isDefaultBilling,
        );

    if (!defaultAddress) {
        return;
    }

    try {
        await updateAddress(defaultAddress);
    } catch {
        /* Do nothing: we should not block shoppers from buying. */
    }
}
