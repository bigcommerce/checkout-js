import { type Address } from '@bigcommerce/checkout-sdk';

export default function stripExtraFieldsFromAddress(address: Address): Omit<Address, 'extraFields'> {
    const { extraFields: _extraFields, ...rest } = address;

    return rest;
}
