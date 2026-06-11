import { type FormField } from '@bigcommerce/checkout-sdk';

import { B2BExtraFieldsSessionStorage } from '../address';

import { buildAddressExtraInfo, buildExtraFields, buildOrderExtraFields } from './b2bMetadata';

describe('b2bMetadata', () => {
    const orderExtraFields = [
        { name: 'field_25', label: 'Cost Centre' },
        { name: 'field_26', label: 'Department' },
    ] as FormField[];

    afterEach(() => {
        sessionStorage.clear();
    });

    describe('buildExtraFields', () => {
        it('maps each stored field name to its label from the field definitions', () => {
            expect(buildExtraFields({ field_25: 'Engineering' }, orderExtraFields)).toEqual([
                { fieldName: 'Cost Centre', fieldValue: 'Engineering' },
            ]);
        });

        it('falls back to the stored field name when no matching definition is found', () => {
            expect(buildExtraFields({ field_99: 'value' }, orderExtraFields)).toEqual([
                { fieldName: 'field_99', fieldValue: 'value' },
            ]);
        });

        it('falls back to the stored field name when no definitions are provided', () => {
            expect(buildExtraFields({ field_25: 'Engineering' })).toEqual([
                { fieldName: 'field_25', fieldValue: 'Engineering' },
            ]);
        });

        it('returns an empty array when nothing is stored', () => {
            expect(buildExtraFields(undefined, orderExtraFields)).toEqual([]);
        });
    });

    describe('buildOrderExtraFields', () => {
        it('reads the stored order extra fields and maps names to labels', () => {
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.ORDER_KEY, {
                field_25: 'Engineering',
                field_26: 'Finance',
            });

            expect(buildOrderExtraFields(orderExtraFields)).toEqual([
                { fieldName: 'Cost Centre', fieldValue: 'Engineering' },
                { fieldName: 'Department', fieldValue: 'Finance' },
            ]);
        });
    });

    describe('buildAddressExtraInfo', () => {
        const addressExtraFields = [
            { name: 'field_30', label: 'Floor' },
            { name: 'field_31', label: 'Dock' },
        ] as FormField[];

        it('maps billing and shipping address field names to their labels', () => {
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.BILLING_KEY, {
                field_30: '3',
            });
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY, {
                field_31: 'B7',
            });

            expect(buildAddressExtraInfo(addressExtraFields)).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'Floor', fieldValue: '3' }],
                    shippingAddressExtraFields: [{ fieldName: 'Dock', fieldValue: 'B7' }],
                },
            });
        });

        it('falls back to the stored field name when no field definitions are provided', () => {
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.BILLING_KEY, {
                field_30: '3',
            });

            expect(buildAddressExtraInfo()).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'field_30', fieldValue: '3' }],
                    shippingAddressExtraFields: [],
                },
            });
        });

        it('excludes the shouldSaveAddress flag from the address extra fields payload', () => {
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.BILLING_KEY, {
                field_30: '3',
                shouldSaveAddress: true,
            });
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY, {
                field_31: 'B7',
                shouldSaveAddress: false,
            });

            expect(buildAddressExtraInfo(addressExtraFields)).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'Floor', fieldValue: '3' }],
                    shippingAddressExtraFields: [{ fieldName: 'Dock', fieldValue: 'B7' }],
                },
            });
        });
    });
});
