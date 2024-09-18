import { Address } from '@bigcommerce/checkout-sdk';

export function getShippingAddress(): Address {
    return {
        firstName: 'Test',
        lastName: 'Tester',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        shouldSaveAddress: true,
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };
}
