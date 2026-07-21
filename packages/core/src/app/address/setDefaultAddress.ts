import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { encodeAddressForWrite } from './addressLabelUtils';
import AddressType from './AddressType';

interface SetDefaultAddressOptions {
    type: AddressType;
    currentAddress?: Address;
    addresses?: CustomerAddress[];
    decode?(address: CustomerAddress): CustomerAddress;
    updateAddress(address: Address): Promise<unknown>;
}

export default async function setDefaultAddress({
    type,
    currentAddress,
    addresses,
    decode = (address) => address,
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

    // Book entries carry the B2B label in `b2b.label`; decode lifts it into `label` (no-op when the
    // capability is off) and encode folds it into `company` for the write. encode is lossless when
    // there's no label, so this is safe for non-B2B addresses too.
    try {
        await updateAddress(encodeAddressForWrite(decode(defaultAddress)));
    } catch {
        /* Do nothing: we should not block shoppers from buying. */
    }
}
