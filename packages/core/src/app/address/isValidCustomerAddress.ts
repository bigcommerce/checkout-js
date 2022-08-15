import { Address, CustomerAddress, FormField } from '@bigcommerce/checkout-sdk';
import { some } from 'lodash';

import isEqualAddress from './isEqualAddress';
import isValidAddress from './isValidAddress';

export default function isValidCustomerAddress(
    address: Address | undefined,
    addresses: CustomerAddress[],
    formFields: FormField[],
): boolean {
    if (!address || !isValidAddress(address, formFields)) {
        return false;
    }

    return some(addresses, (customerAddress) => isEqualAddress(customerAddress, address));
}
