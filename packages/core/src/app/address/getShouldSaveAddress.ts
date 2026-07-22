import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

export default function getShouldSaveAddress(address?: Address | CustomerAddress): boolean {
    if (address && isCustomerAddress(address)) {
        return false;
    }

    return address?.shouldSaveAddress ?? true;
}

function isCustomerAddress(address: Address | CustomerAddress): address is CustomerAddress {
    return 'id' in address && 'type' in address;
}
