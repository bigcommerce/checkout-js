import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { getPaymentMethod } from '../payment-methods.mock';

import isSamePaymentMethod from './isSamePaymentMethod';

describe('isSamePaymentMethod', () => {
    it('returns true when methods share the same id and gateway', () => {
        const method: PaymentMethod = getPaymentMethod();

        expect(isSamePaymentMethod(method, { ...method })).toBe(true);
    });

    it('returns false when methods have different ids', () => {
        const method: PaymentMethod = getPaymentMethod();

        expect(isSamePaymentMethod(method, { ...method, id: 'braintree' })).toBe(false);
    });

    it('returns false when methods have different gateways', () => {
        const method: PaymentMethod = getPaymentMethod();

        expect(isSamePaymentMethod(method, { ...method, gateway: 'adyen' })).toBe(false);
    });
});
