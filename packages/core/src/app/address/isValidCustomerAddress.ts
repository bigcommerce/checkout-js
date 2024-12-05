import { Address, CustomerAddress, FormField } from '@bigcommerce/checkout-sdk';
import { some } from 'lodash';

import isEqualAddress from './isEqualAddress';
import isValidAddress from './isValidAddress';

export default function isValidCustomerAddress(
    address: Address | undefined,
    addresses: CustomerAddress[],
    formFields: FormField[],
    validateAddressFields?: boolean,
): boolean {
    if (!address || !isValidAddress(address, formFields, validateAddressFields)) {
        return false;
    }

    return some(addresses, (customerAddress) => isEqualAddress(customerAddress, address));
}
