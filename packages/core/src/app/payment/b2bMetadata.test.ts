import { type Address, B2B_EXTRA_FIELD_PREFIX, type FormField } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import {
    type B2BPaymentFormValues,
    buildAddressExtraFields,
    buildAddressExtraInfo,
    buildB2BMetadataOptions,
    buildExtraFields,
    storeB2BPaymentValues,
} from './b2bMetadata';

describe('b2bMetadata', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('buildExtraFields', () => {
        const orderExtraFields = [
            { name: 'field_25', label: 'Cost Centre' },
            { name: 'field_26', label: 'Department' },
        ] as FormField[];

        it('maps each form field name to its label from the field definitions', () => {
            expect(buildExtraFields({ field_25: 'Engineering' }, orderExtraFields)).toEqual([
                { fieldName: 'Cost Centre', fieldValue: 'Engineering' },
            ]);
        });

        it('falls back to the form field name when no matching definition is found', () => {
            expect(buildExtraFields({ field_99: 'value' }, orderExtraFields)).toEqual([
                { fieldName: 'field_99', fieldValue: 'value' },
            ]);
        });

        it('falls back to the form field name when no definitions are provided', () => {
            expect(buildExtraFields({ field_25: 'Engineering' })).toEqual([
                { fieldName: 'field_25', fieldValue: 'Engineering' },
            ]);
        });

        it('returns an empty array when there are no form values', () => {
            expect(buildExtraFields(undefined, orderExtraFields)).toEqual([]);
        });
    });

    describe('buildAddressExtraFields', () => {
        const addressExtraFields = [
            { name: `${B2B_EXTRA_FIELD_PREFIX}30`, label: 'Floor' },
            { name: `${B2B_EXTRA_FIELD_PREFIX}31`, label: 'Dock' },
        ] as FormField[];

        it('maps each raw field id to the label of its prefixed field definition', () => {
            expect(
                buildAddressExtraFields([{ fieldId: '30', fieldValue: '3' }], addressExtraFields),
            ).toEqual([{ fieldName: 'Floor', fieldValue: '3' }]);
        });

        it('falls back to the raw field id when no matching definition is found', () => {
            expect(buildAddressExtraFields([{ fieldId: '99', fieldValue: 'value' }])).toEqual([
                { fieldName: '99', fieldValue: 'value' },
            ]);
        });

        it('returns an empty array when the address has no extra fields', () => {
            expect(buildAddressExtraFields(undefined, addressExtraFields)).toEqual([]);
        });
    });

    describe('buildAddressExtraInfo', () => {
        const addressExtraFields = [
            { name: `${B2B_EXTRA_FIELD_PREFIX}30`, label: 'Floor' },
            { name: `${B2B_EXTRA_FIELD_PREFIX}31`, label: 'Dock' },
        ] as FormField[];

        const buildAddress = (extraFields: Address['extraFields']): Address =>
            ({ extraFields }) as Address;

        it('maps billing and shipping address extra fields to their labels', () => {
            expect(
                buildAddressExtraInfo(
                    buildAddress([{ fieldId: '30', fieldValue: '3' }]),
                    buildAddress([{ fieldId: '31', fieldValue: 'B7' }]),
                    addressExtraFields,
                ),
            ).toEqual({
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'Floor', fieldValue: '3' }],
                    shippingAddressExtraFields: [{ fieldName: 'Dock', fieldValue: 'B7' }],
                },
            });
        });

        it('omits the address extra fields when neither address has any', () => {
            expect(buildAddressExtraInfo(buildAddress([]), buildAddress(undefined))).toEqual({});
        });

        it('includes the stored billing and shipping address ids', () => {
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });

            expect(buildAddressExtraInfo()).toEqual({
                billingAddressId: 11,
                shipppingAddressId: 22,
            });
        });
    });

    describe('buildB2BMetadataOptions', () => {
        const formValues: B2BPaymentFormValues = {
            poNumber: 'PO-123',
            invoicePaymentComment: 'Please rush this order',
            additionalPaymentField: 'REF-456',
            orderExtraFields: { costCentre: 'Engineering' },
        };

        it('builds the payload from the payment form values when they are available', () => {
            expect(buildB2BMetadataOptions(true, { formValues })).toEqual({
                isInvoice: true,
                invoiceComment: 'Please rush this order',
                poNumber: 'PO-123',
                referenceNumber: 'REF-456',
                extraFields: [{ fieldName: 'costCentre', fieldValue: 'Engineering' }],
                extraInfo: {},
            });
        });

        it('falls back to the values captured at submit time when the form state is gone', () => {
            storeB2BPaymentValues(formValues);

            expect(buildB2BMetadataOptions(false)).toEqual({
                isInvoice: false,
                invoiceComment: 'Please rush this order',
                poNumber: 'PO-123',
                referenceNumber: 'REF-456',
                extraFields: [{ fieldName: 'costCentre', fieldValue: 'Engineering' }],
                extraInfo: {},
            });
        });

        it('builds an empty payload when there are neither form values nor captured values', () => {
            expect(buildB2BMetadataOptions(false)).toEqual({
                isInvoice: false,
                invoiceComment: undefined,
                poNumber: undefined,
                referenceNumber: undefined,
                extraFields: [],
                extraInfo: {},
            });
        });
    });
});
