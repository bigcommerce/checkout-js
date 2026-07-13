import { B2B_EXTRA_FIELD_PREFIX } from '@bigcommerce/checkout-sdk';

import { mapToB2BOrderRequestBody } from './b2bMetadataForSubmitOrder';

describe('b2bMetadataForSubmitOrder', () => {
    describe('mapToB2BOrderRequestBody', () => {
        it('maps the payment form values to the order request fields', () => {
            expect(
                mapToB2BOrderRequestBody({
                    poNumber: 'PO-123',
                    additionalPaymentField: 'REF-456',
                    orderExtraFields: { [`${B2B_EXTRA_FIELD_PREFIX}500`]: 'Engineering' },
                }),
            ).toEqual({
                poNumber: 'PO-123',
                additionalText: 'REF-456',
                orderExtraFields: [{ fieldId: '500', fieldValue: 'Engineering' }],
            });
        });

        it('keeps the field name as the id when it has no B2B prefix', () => {
            expect(mapToB2BOrderRequestBody({ orderExtraFields: { customField: 7 } })).toEqual({
                orderExtraFields: [{ fieldId: 'customField', fieldValue: 7 }],
            });
        });

        it('omits empty and non-scalar extra field values', () => {
            expect(
                mapToB2BOrderRequestBody({
                    orderExtraFields: {
                        empty: '',
                        missing: undefined,
                        tampered: { nested: true },
                        filled: 'value',
                    },
                }),
            ).toEqual({ orderExtraFields: [{ fieldId: 'filled', fieldValue: 'value' }] });
        });

        it('omits the keys when the values are empty or missing', () => {
            expect(mapToB2BOrderRequestBody({ poNumber: '', orderExtraFields: {} })).toEqual({});
        });

        it('omits values that are not strings', () => {
            expect(
                mapToB2BOrderRequestBody({ poNumber: 123, additionalPaymentField: true }),
            ).toEqual({});
        });
    });
});
