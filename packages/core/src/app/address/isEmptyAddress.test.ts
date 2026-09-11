import { getEmptyBillingAddress } from '../billing/billingAddresses.mock';

import { getAddress } from './address.mock';
import { isEmptyAddress } from './isEmptyAddress';

describe('isEmptyAddress', () => {
    it('returns true when the address is undefined', () => {
        expect(isEmptyAddress(undefined)).toBe(true);
    });

    it('returns true for a guest billing address that only carries an email', () => {
        expect(isEmptyAddress(getEmptyBillingAddress())).toBe(true);
    });

    it('returns true when only ignored or geo-prefilled fields are set', () => {
        expect(
            isEmptyAddress({
                ...getEmptyBillingAddress(),
                id: 'x',
                email: 'test@bigcommerce.com',
                shouldSaveAddress: true,
                country: 'Australia',
                countryCode: 'AU',
            }),
        ).toBe(true);
    });

    it('returns false when any address field is set', () => {
        expect(
            isEmptyAddress({
                ...getEmptyBillingAddress(),
                address1: '12345 Testing Way',
            }),
        ).toBe(false);

        expect(
            isEmptyAddress({
                ...getEmptyBillingAddress(),
                firstName: 'Test',
            }),
        ).toBe(false);

        expect(
            isEmptyAddress({
                ...getEmptyBillingAddress(),
                stateOrProvince: 'California',
            }),
        ).toBe(false);
    });

    it('returns false when only a non-empty custom field is set', () => {
        expect(
            isEmptyAddress({
                ...getEmptyBillingAddress(),
                customFields: [{ fieldId: 'field_25', fieldValue: 'foo' }],
            }),
        ).toBe(false);
    });

    it('returns false for a complete address', () => {
        expect(isEmptyAddress(getAddress())).toBe(false);
    });
});
