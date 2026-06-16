import { type FormField } from '@bigcommerce/checkout-sdk';

import { buildAddressExtraInfo, buildExtraFields } from './b2bMetadata';

describe('b2bMetadata', () => {
    const orderExtraFields = [
        { name: 'field_25', label: 'Cost Centre' },
        { name: 'field_26', label: 'Department' },
    ] as FormField[];

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

    describe('buildAddressExtraInfo', () => {
        const addressExtraFields = [
            { name: 'field_30', label: 'Floor' },
            { name: 'field_31', label: 'Dock' },
        ] as FormField[];

        it('maps billing and shipping address field names to their labels', () => {
            expect(
                buildAddressExtraInfo(
                    {
                        billingExtraFields: { field_30: '3' },
                        shippingExtraFields: { field_31: 'B7' },
                    },
                    addressExtraFields,
                ),
            ).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'Floor', fieldValue: '3' }],
                    shippingAddressExtraFields: [{ fieldName: 'Dock', fieldValue: 'B7' }],
                },
            });
        });

        it('falls back to the stored field name when no field definitions are provided', () => {
            expect(buildAddressExtraInfo({ billingExtraFields: { field_30: '3' } })).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'field_30', fieldValue: '3' }],
                    shippingAddressExtraFields: [],
                },
            });
        });

        it('excludes the shouldSaveAddress flag from the address extra fields payload', () => {
            expect(
                buildAddressExtraInfo(
                    {
                        billingExtraFields: { field_30: '3', shouldSaveAddress: true },
                        shippingExtraFields: { field_31: 'B7', shouldSaveAddress: false },
                    },
                    addressExtraFields,
                ),
            ).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'Floor', fieldValue: '3' }],
                    shippingAddressExtraFields: [{ fieldName: 'Dock', fieldValue: 'B7' }],
                },
            });
        });

        it('includes the stored billing and shipping address ids', () => {
            expect(buildAddressExtraInfo({ billingAddressId: 11, shippingAddressId: 22 })).toEqual({
                billingAddressId: 11,
                shipppingAddressId: 22,
            });
        });
    });
});
