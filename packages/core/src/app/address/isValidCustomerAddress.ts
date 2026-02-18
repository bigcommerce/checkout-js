import { type Address, type CustomerAddress, type FormField } from '@bigcommerce/checkout-sdk';
import { some } from 'lodash';

import isEqualAddress from './isEqualAddress';
import isValidAddress from './isValidAddress';

export default function isValidCustomerAddress(
    address: Address | undefined,
    addresses: CustomerAddress[],
    formFields: FormField[],
    validateMaxLength?: boolean,
): boolean {
    if (!address || !isValidAddress(address, formFields, validateMaxLength)) {
        return false;
    }

    return some(addresses, (customerAddress) => isEqualAddress(customerAddress, address));
}
