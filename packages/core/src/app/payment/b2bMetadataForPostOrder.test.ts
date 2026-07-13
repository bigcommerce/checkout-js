import { type Address, B2B_EXTRA_FIELD_PREFIX, type FormField } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { type B2BPaymentFormValues, storeB2BPaymentValues } from './b2bMetadata';
import {
    getB2BMetadataPayload,
    getExtraInfoValues,
    getOrderExtraFieldsValues,
} from './b2bMetadataForPostOrder';

describe('b2bMetadataForPostOrder', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('getOrderExtraFieldsValues', () => {
        const orderExtraFields = [
            { name: 'field_25', label: 'Cost Centre' },
            { name: 'field_26', label: 'Department' },
        ] as FormField[];

        it('maps each form field name to its label from the field definitions', () => {
            expect(
                getOrderExtraFieldsValues({ field_25: 'Engineering' }, orderExtraFields),
            ).toEqual([{ fieldName: 'Cost Centre', fieldValue: 'Engineering' }]);
        });

        it('falls back to the form field name when no matching definition is found', () => {
            expect(getOrderExtraFieldsValues({ field_99: 'value' }, orderExtraFields)).toEqual([
                { fieldName: 'field_99', fieldValue: 'value' },
            ]);
        });

        it('falls back to the form field name when no definitions are provided', () => {
            expect(getOrderExtraFieldsValues({ field_25: 'Engineering' })).toEqual([
                { fieldName: 'field_25', fieldValue: 'Engineering' },
            ]);
        });

        it('omits fields with empty values', () => {
            expect(
                getOrderExtraFieldsValues({ field_25: '', field_26: 'Finance' }, orderExtraFields),
            ).toEqual([{ fieldName: 'Department', fieldValue: 'Finance' }]);
        });

        it('returns an empty array when there are no form values', () => {
            expect(getOrderExtraFieldsValues(undefined, orderExtraFields)).toEqual([]);
        });
    });

    describe('getExtraInfoValues', () => {
        const addressExtraFields = [
            { name: `${B2B_EXTRA_FIELD_PREFIX}30`, label: 'Floor' },
            { name: `${B2B_EXTRA_FIELD_PREFIX}31`, label: 'Dock' },
        ] as FormField[];

        const buildAddress = (extraFields: Address['extraFields']): Address =>
            ({ extraFields }) as Address;

        it('maps billing and shipping address extra fields to their labels', () => {
            expect(
                getExtraInfoValues(
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
            expect(getExtraInfoValues(buildAddress([]), buildAddress(undefined))).toEqual({});
        });

        it('includes the stored billing and shipping address ids', () => {
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });

            expect(getExtraInfoValues()).toEqual({
                billingAddressId: 11,
                shipppingAddressId: 22,
            });
        });
    });

    describe('getB2BMetadataPayload', () => {
        const formValues: B2BPaymentFormValues = {
            poNumber: 'PO-123',
            invoicePaymentComment: 'Please rush this order',
            additionalPaymentField: 'REF-456',
            orderExtraFields: { costCentre: 'Engineering' },
        };

        it('builds the payload from the payment form values when they are available', () => {
            expect(getB2BMetadataPayload(true, { formValues })).toEqual({
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

            expect(getB2BMetadataPayload(false)).toEqual({
                isInvoice: false,
                invoiceComment: 'Please rush this order',
                poNumber: 'PO-123',
                referenceNumber: 'REF-456',
                extraFields: [{ fieldName: 'costCentre', fieldValue: 'Engineering' }],
                extraInfo: {},
            });
        });

        it('builds an empty payload when there are neither form values nor captured values', () => {
            expect(getB2BMetadataPayload(false)).toEqual({
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
