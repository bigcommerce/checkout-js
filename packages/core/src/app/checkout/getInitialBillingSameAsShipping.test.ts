import { getAddress } from '../address/address.mock';
import { getBillingAddress, getEmptyBillingAddress } from '../billing/billingAddresses.mock';

import { getInitialBillingSameAsShipping } from './getInitialBillingSameAsShipping';

describe('getInitialBillingSameAsShipping', () => {
    it('returns the store default when there is no shipping address', () => {
        expect(
            getInitialBillingSameAsShipping({
                billingAddress: getBillingAddress(),
                shippingAddress: undefined,
                defaultValue: true,
            }),
        ).toBe(true);

        expect(
            getInitialBillingSameAsShipping({
                billingAddress: getBillingAddress(),
                shippingAddress: undefined,
                defaultValue: false,
            }),
        ).toBe(false);
    });

    it('returns the store default when the billing address is empty', () => {
        expect(
            getInitialBillingSameAsShipping({
                billingAddress: getEmptyBillingAddress(),
                shippingAddress: getAddress(),
                defaultValue: true,
            }),
        ).toBe(true);

        expect(
            getInitialBillingSameAsShipping({
                billingAddress: getEmptyBillingAddress(),
                shippingAddress: getAddress(),
                defaultValue: false,
            }),
        ).toBe(false);

        expect(
            getInitialBillingSameAsShipping({
                billingAddress: undefined,
                shippingAddress: getAddress(),
                defaultValue: true,
            }),
        ).toBe(true);
    });

    it('returns true when the billing address equals the shipping address, ignoring noise fields', () => {
        expect(
            getInitialBillingSameAsShipping({
                billingAddress: { ...getBillingAddress(), ...getAddress(), id: 'billing-id' },
                shippingAddress: getAddress(),
                defaultValue: false,
            }),
        ).toBe(true);
    });

    it('returns false when the billing address differs from the shipping address', () => {
        expect(
            getInitialBillingSameAsShipping({
                billingAddress: { ...getBillingAddress(), address1: '130 Pitt St' },
                shippingAddress: getAddress(),
                defaultValue: true,
            }),
        ).toBe(false);
    });
});
