import { type Address } from '@bigcommerce/checkout-sdk';
import { omit } from 'lodash';

// `CustomerAddress` extends `Address` with address-book metadata that is not part
// of `AddressRequestBody`. When a saved address is selected it's passed straight to
// the update calls, so strip these so we don't forward them to the API.
const CUSTOMER_ADDRESS_ONLY_FIELDS = [
    'id',
    'type',
    'isShipping',
    'isBilling',
    'isDefaultShipping',
    'isDefaultBilling',
];

export default function stripCustomerAddressFields<T extends Partial<Address>>(address: T): T {
    return omit(address, CUSTOMER_ADDRESS_ONLY_FIELDS) as T;
}
