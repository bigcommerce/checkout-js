import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

type CustomerAddressB2B = NonNullable<CustomerAddress['b2b']>;

export function getCustomerAddressB2B(
    overrides: Partial<CustomerAddressB2B> = {},
): CustomerAddressB2B {
    return {
        isShipping: false,
        isBilling: false,
        isDefaultShipping: false,
        isDefaultBilling: false,
        label: '',
        extraFields: [],
        ...overrides,
    };
}

export function getAddress(): Address {
    return {
        firstName: 'Test',
        lastName: 'Tester',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };
}
