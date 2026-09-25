import { type Customer, type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { getCustomer, getGuestCustomer, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import {
    canVaultGooglePayInstrument,
    isWalletAutoVaultingEnabled,
} from './canVaultGooglePayInstrument';

describe('canVaultGooglePayInstrument', () => {
    let customer: Customer;
    let method: PaymentMethod;

    beforeEach(() => {
        customer = getCustomer();
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.StripeOCSGooglePay,
            config: { ...getPaymentMethod().config, vaultingWalletEnabled: true },
        };
    });

    it('allows vaulting for a signed-in shopper when the merchant enabled wallet vaulting', () => {
        expect(canVaultGooglePayInstrument({ customer, method })).toBe(true);
    });

    it('does not allow vaulting when the merchant has wallet vaulting disabled', () => {
        expect(
            canVaultGooglePayInstrument({
                customer,
                method: { ...method, config: { ...method.config, vaultingWalletEnabled: false } },
            }),
        ).toBe(false);
    });

    it('does not allow vaulting when the flag is absent from the method config', () => {
        expect(
            canVaultGooglePayInstrument({
                customer,
                method: { ...method, config: getPaymentMethod().config },
            }),
        ).toBe(false);
    });

    it.each([PaymentMethodId.StripeGooglePay, PaymentMethodId.StripeUPEGooglePay])(
        'does not allow vaulting on %s — those methods carry no wallet vaulting setting',
        (id) => {
            expect(
                canVaultGooglePayInstrument({
                    customer,
                    method: { ...method, id, config: getPaymentMethod().config },
                }),
            ).toBe(false);
        },
    );

    it('allows vaulting on any provider whose config enables wallet vaulting', () => {
        expect(
            canVaultGooglePayInstrument({
                customer,
                method: { ...method, id: PaymentMethodId.BraintreeGooglePay },
            }),
        ).toBe(true);
    });

    it('does not allow vaulting for a guest shopper by default', () => {
        expect(canVaultGooglePayInstrument({ customer: getGuestCustomer(), method })).toBe(false);
    });

    it('does not allow vaulting for a guest shopper even when auto-vaulting is on', () => {
        expect(
            canVaultGooglePayInstrument({
                customer: getGuestCustomer(),
                method: {
                    ...method,
                    config: { ...method.config, vaultInstrumentForAllWalletPayments: true },
                },
            }),
        ).toBe(false);
    });

    it('does not allow vaulting before the customer has loaded', () => {
        expect(canVaultGooglePayInstrument({ customer: undefined, method })).toBe(false);
    });
});

describe('isWalletAutoVaultingEnabled', () => {
    const method = {
        ...getPaymentMethod(),
        config: {
            ...getPaymentMethod().config,
            vaultingWalletEnabled: true,
            vaultInstrumentForAllWalletPayments: true,
        },
    };

    it('is enabled when the merchant vaults every wallet payment', () => {
        expect(isWalletAutoVaultingEnabled(method)).toBe(true);
    });

    it('is disabled when the merchant does not vault every wallet payment', () => {
        expect(
            isWalletAutoVaultingEnabled({
                ...method,
                config: { ...method.config, vaultInstrumentForAllWalletPayments: false },
            }),
        ).toBe(false);
    });

    it('keys off the guest setting alone — the control panel clears it when wallet vaulting is off', () => {
        expect(
            isWalletAutoVaultingEnabled({
                ...method,
                config: { ...method.config, vaultingWalletEnabled: false },
            }),
        ).toBe(true);
    });
});
