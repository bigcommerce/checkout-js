import { type Customer, type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { getCustomer, getGuestCustomer, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import { canVaultWalletInstrument } from './canVaultWalletInstrument';

describe('canVaultWalletInstrument', () => {
    let customer: Customer;
    let method: PaymentMethod;

    beforeEach(() => {
        customer = getCustomer();
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.StripeOCSGooglePay,
            config: { ...getPaymentMethod().config, isVaultingEnabled: true },
        };
    });

    it('allows vaulting for a signed-in shopper when the merchant enabled wallet vaulting', () => {
        expect(canVaultWalletInstrument({ customer, method })).toBe(true);
    });

    it('does not allow vaulting when the merchant has wallet vaulting disabled', () => {
        expect(
            canVaultWalletInstrument({
                customer,
                method: { ...method, config: { ...method.config, isVaultingEnabled: false } },
            }),
        ).toBe(false);
    });

    it('does not allow vaulting when the flag is absent from the method config', () => {
        expect(
            canVaultWalletInstrument({
                customer,
                method: { ...method, config: getPaymentMethod().config },
            }),
        ).toBe(false);
    });

    it.each([PaymentMethodId.StripeGooglePay, PaymentMethodId.StripeUPEGooglePay])(
        'does not allow vaulting on %s — those methods carry no wallet vaulting setting',
        (id) => {
            expect(
                canVaultWalletInstrument({
                    customer,
                    method: { ...method, id, config: getPaymentMethod().config },
                }),
            ).toBe(false);
        },
    );

    it('allows vaulting on any provider whose config enables wallet vaulting', () => {
        expect(
            canVaultWalletInstrument({
                customer,
                method: { ...method, id: PaymentMethodId.BraintreeGooglePay },
            }),
        ).toBe(true);
    });

    it('does not allow vaulting for a guest shopper by default', () => {
        expect(canVaultWalletInstrument({ customer: getGuestCustomer(), method })).toBe(false);
    });

    it('does not allow vaulting for a guest shopper even when auto-vaulting is on', () => {
        expect(
            canVaultWalletInstrument({
                customer: getGuestCustomer(),
                method: {
                    ...method,
                    config: { ...method.config, shouldVaultAllPayments: true },
                },
            }),
        ).toBe(false);
    });

    it('does not allow vaulting before the customer has loaded', () => {
        expect(canVaultWalletInstrument({ customer: undefined, method })).toBe(false);
    });
});
