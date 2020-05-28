import { getCheckout, getCheckoutWithPayments } from '../checkout/checkouts.mock';

import canSignOut from './canSignOut';
import { getCustomer, getGuestCustomer } from './customers.mock';

describe('canSignOut()', () => {
    it('returns false if customer is guest', () => {
        const customer = getGuestCustomer();
        const checkout = getCheckout();

        expect(canSignOut(customer, checkout, ''))
            .toEqual(false);
    });

    it('returns true if customer is signed in', () => {
        const customer = getCustomer();
        const checkout = getCheckout();

        expect(canSignOut(customer, checkout, ''))
            .toEqual(true);
    });

    it('returns false if customer started with payment method that does not allow sign-out', () => {
        const customer = getCustomer();
        const checkout = getCheckoutWithPayments();

        expect(canSignOut(customer, checkout, ''))
            .toEqual(false);
    });

    it('returns true if customer uses amazon as checkout method', () => {
        const customer = getCustomer();
        const checkout = getCheckoutWithPayments();

        expect(canSignOut(customer, checkout, 'amazon'))
            .toEqual(true);
    });

    it('returns true if customer uses amazonpay as checkout method', () => {
        const customer = getCustomer();
        const checkout = getCheckoutWithPayments();

        expect(canSignOut(customer, checkout, 'amazonpay'))
            .toEqual(true);
    });
});
