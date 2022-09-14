import { Order } from '@bigcommerce/checkout-sdk';

import getPaymentInstructions from './getPaymentInstructions';
import { getGiftCertificateOrderPayment, getOrder } from './orders.mock';

describe('getPaymentInstructions()', () => {
    describe('when order has payment with instructions', () => {
        const order = getOrder();

        it('returns instructions', () => {
            expect(getPaymentInstructions(order)).toBe('<strong>295</strong> something');
        });
    });

    describe('when order has no payments with instructions', () => {
        const order = {
            ...getOrder(),
            payments: [getGiftCertificateOrderPayment()],
        };

        it('returns empty string', () => {
            expect(getPaymentInstructions(order)).toBe('');
        });
    });

    describe('when order has no payments', () => {
        const order: Order = {
            ...getOrder(),
            payments: [],
        };

        it('returns empty string', () => {
            expect(getPaymentInstructions(order)).toBe('');
        });
    });
});
