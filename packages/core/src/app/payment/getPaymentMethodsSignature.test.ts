import getPaymentMethodsSignature from './getPaymentMethodsSignature';
import {
    getMobilePaymentMethod,
    getPaymentMethod,
    getPaypalCreditPaymentMethod,
} from './payment-methods.mock';

describe('getPaymentMethodsSignature()', () => {
    it('returns an empty signature for an empty list', () => {
        expect(getPaymentMethodsSignature([])).toBe('');
    });

    it('is stable regardless of array order (order-independent)', () => {
        const a = getPaymentMethod();
        const b = getPaypalCreditPaymentMethod();

        expect(getPaymentMethodsSignature([a, b])).toBe(getPaymentMethodsSignature([b, a]));
    });

    it('is the same when the reload returns an equivalent (new-reference) list of the same methods', () => {
        const before = [getPaymentMethod(), getPaypalCreditPaymentMethod()];
        // Simulates a fresh array from a re-fetch with the same underlying methods.
        const after = [{ ...getPaymentMethod() }, { ...getPaypalCreditPaymentMethod() }];

        expect(getPaymentMethodsSignature(before)).toBe(getPaymentMethodsSignature(after));
    });

    it('changes when a method is added', () => {
        const before = [getPaymentMethod()];
        const after = [getPaymentMethod(), getPaypalCreditPaymentMethod()];

        expect(getPaymentMethodsSignature(before)).not.toBe(getPaymentMethodsSignature(after));
    });

    it('changes when a method is removed', () => {
        const before = [getPaymentMethod(), getPaypalCreditPaymentMethod()];
        const after = [getPaymentMethod()];

        expect(getPaymentMethodsSignature(before)).not.toBe(getPaymentMethodsSignature(after));
    });

    it('treats different gateways for the same method id as different methods', () => {
        const before = [getPaymentMethod()];
        const after = [{ ...getPaymentMethod(), gateway: 'some-gateway' }];

        expect(getPaymentMethodsSignature(before)).not.toBe(getPaymentMethodsSignature(after));
    });

    it('distinguishes methods that only differ by id', () => {
        const before = [getPaymentMethod()];
        const after = [getMobilePaymentMethod()];

        expect(getPaymentMethodsSignature(before)).not.toBe(getPaymentMethodsSignature(after));
    });
});
