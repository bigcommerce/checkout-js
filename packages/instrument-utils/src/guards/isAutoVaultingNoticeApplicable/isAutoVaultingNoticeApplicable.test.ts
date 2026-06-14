import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import isAutoVaultingNoticeApplicable from './isAutoVaultingNoticeApplicable';

describe('isAutoVaultingNoticeApplicable', () => {
    it('returns true when the payment method config enables vaulting all payments', () => {
        const paymentMethod = {
            ...getPaymentMethod(),
            config: { ...getPaymentMethod().config, shouldVaultAllPayments: true },
        };

        expect(isAutoVaultingNoticeApplicable({ paymentMethod })).toBe(true);
    });

    it('returns false when the flag is explicitly false', () => {
        const paymentMethod = {
            ...getPaymentMethod(),
            config: { ...getPaymentMethod().config, shouldVaultAllPayments: false },
        };

        expect(isAutoVaultingNoticeApplicable({ paymentMethod })).toBe(false);
    });

    it('returns false when the flag is absent from the config', () => {
        expect(isAutoVaultingNoticeApplicable({ paymentMethod: getPaymentMethod() })).toBe(false);
    });
});
