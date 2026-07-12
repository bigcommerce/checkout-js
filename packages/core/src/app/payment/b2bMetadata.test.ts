import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { clearB2BMetadataStorage, storeB2BPaymentValues } from './b2bMetadata';

describe('b2bMetadata', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('storeB2BPaymentValues', () => {
        it('stores the captured payment form values', () => {
            storeB2BPaymentValues({
                poNumber: 'PO-123',
                invoicePaymentComment: 'Please rush this order',
                additionalPaymentField: 'REF-456',
                orderExtraFields: { costCentre: 'Engineering' },
            });

            expect(B2BSessionStorage.getPaymentValues()).toEqual({
                poNumber: 'PO-123',
                invoicePaymentComment: 'Please rush this order',
                additionalPaymentField: 'REF-456',
                orderExtraFields: { costCentre: 'Engineering' },
            });
        });

        it('drops values that do not have the expected type', () => {
            storeB2BPaymentValues({
                poNumber: 123,
                invoicePaymentComment: { nested: true },
                additionalPaymentField: undefined,
                orderExtraFields: 'not-a-record',
            });

            expect(B2BSessionStorage.getPaymentValues()).toEqual({});
        });
    });

    describe('clearB2BMetadataStorage', () => {
        it('clears every stored B2B value', () => {
            storeB2BPaymentValues({ poNumber: 'PO-123' });
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });

            clearB2BMetadataStorage();

            expect(B2BSessionStorage.getPaymentValues()).toBeUndefined();
            expect(B2BSessionStorage.getAddressIds()).toEqual({
                billingAddressId: undefined,
                shippingAddressId: undefined,
            });
        });
    });
});
