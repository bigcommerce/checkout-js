import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress } from './address.mock';
import { getAddressFormFields, getFormFields } from './formField.mock';
import isValidCustomerAddress from './isValidCustomerAddress';

describe('isValidCustomerAddress()', () => {
    const mockCustomerAddresses: CustomerAddress[] = [
        {
            ...getAddress(),
            id: 5,
            type: 'residential',
        },
    ];

    it('returns true if address is valid and matches a customer address', () => {
        expect(isValidCustomerAddress(getAddress(), mockCustomerAddresses, getFormFields())).toBe(
            true,
        );
    });

    it('returns false if address is not defined', () => {
        expect(isValidCustomerAddress(undefined, mockCustomerAddresses, getFormFields())).toBe(
            false,
        );
    });

    it('returns false if address does not match any customer address', () => {
        expect(
            isValidCustomerAddress(
                { ...getAddress(), address1: '12345 Other Way' },
                mockCustomerAddresses,
                getFormFields(),
            ),
        ).toBe(false);
    });

    describe('phone max length validation', () => {
        const mockFormFieldsWithPhoneMaxLength = getAddressFormFields().map((field) =>
            field.name === 'phone' ? { ...field, maxLength: 8 } : field,
        );

        it('returns false if phone exceeds max length and max length validation is on', () => {
            expect(
                isValidCustomerAddress(
                    getAddress(),
                    mockCustomerAddresses,
                    mockFormFieldsWithPhoneMaxLength,
                    true,
                ),
            ).toBe(false);
        });

        it('returns true if phone exceeds max length but the new phone validation component is enabled', () => {
            expect(
                isValidCustomerAddress(
                    getAddress(),
                    mockCustomerAddresses,
                    mockFormFieldsWithPhoneMaxLength,
                    true,
                    true,
                ),
            ).toBe(true);
        });
    });
});
