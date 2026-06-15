import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import isPaymentMethodAutoVaultingInstruments from './isPaymentMethodAutoVaultingInstruments';

describe('isPaymentMethodAutoVaultingInstruments', () => {
    it('returns true when the payment method config enables vaulting all payments', () => {
        const paymentMethod = {
            ...getPaymentMethod(),
            config: { ...getPaymentMethod().config, shouldVaultAllPayments: true },
        };

        expect(isPaymentMethodAutoVaultingInstruments(paymentMethod)).toBe(true);
    });

    it('returns false when the flag is explicitly false', () => {
        const paymentMethod = {
            ...getPaymentMethod(),
            config: { ...getPaymentMethod().config, shouldVaultAllPayments: false },
        };

        expect(isPaymentMethodAutoVaultingInstruments(paymentMethod)).toBe(false);
    });

    it('returns false when the flag is absent from the config', () => {
        expect(isPaymentMethodAutoVaultingInstruments(getPaymentMethod())).toBe(false);
    });
});
