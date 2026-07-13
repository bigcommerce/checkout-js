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
    const defaultAddress = addresses?.find(({ b2b }) =>
        isShipping
            ? b2b?.isShipping && b2b.isDefaultShipping
            : b2b?.isBilling && b2b.isDefaultBilling,
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
