import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { searchingAddresses } from './searchingAddresses';

const baseAddress: CustomerAddress = {
    id: 1,
    type: 'residential',
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

describe('searchingAddresses', () => {
    it('returns all addresses when query is empty', () => {
        expect(searchingAddresses([baseAddress], '')).toEqual([baseAddress]);
        expect(searchingAddresses([baseAddress], '   ')).toEqual([baseAddress]);
    });

    it('matches on standard address fields', () => {
        expect(searchingAddresses([baseAddress], 'Test')).toEqual([baseAddress]);
        expect(searchingAddresses([baseAddress], 'some city')).toEqual([baseAddress]);
        expect(searchingAddresses([baseAddress], '95555')).toEqual([baseAddress]);
    });

    it('returns empty array when no address matches', () => {
        expect(searchingAddresses([baseAddress], 'zzz')).toEqual([]);
    });

    it('matches on customFields string value', () => {
        const address: CustomerAddress = {
            ...baseAddress,
            customFields: [{ fieldId: 'field_1', fieldValue: 'custom-value' }],
        };

        expect(searchingAddresses([address], 'custom-value')).toEqual([address]);
        expect(searchingAddresses([address], 'no-match')).toEqual([]);
    });

    it('matches on customFields numeric value', () => {
        const address: CustomerAddress = {
            ...baseAddress,
            customFields: [{ fieldId: 'field_2', fieldValue: 42 }],
        };

        expect(searchingAddresses([address], '42')).toEqual([address]);
    });

    it('matches on customFields array value', () => {
        const address: CustomerAddress = {
            ...baseAddress,
            customFields: [{ fieldId: 'field_3', fieldValue: ['foo', 'bar'] }],
        };

        expect(searchingAddresses([address], 'foo')).toEqual([address]);
        expect(searchingAddresses([address], 'bar')).toEqual([address]);
    });

    it('matches on extraFields string value', () => {
        const address: CustomerAddress = {
            ...baseAddress,
            extraFields: [{ fieldId: 'ef_1', fieldValue: 'extra-value' }],
        };

        expect(searchingAddresses([address], 'extra-value')).toEqual([address]);
        expect(searchingAddresses([address], 'no-match')).toEqual([]);
    });

    it('matches on extraFields numeric value', () => {
        const address: CustomerAddress = {
            ...baseAddress,
            extraFields: [{ fieldId: 'ef_2', fieldValue: 99 }],
        };

        expect(searchingAddresses([address], '99')).toEqual([address]);
    });

    it('handles missing extraFields gracefully', () => {
        const address: CustomerAddress = { ...baseAddress };

        expect(searchingAddresses([address], 'Test')).toEqual([address]);
    });
});
