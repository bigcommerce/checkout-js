import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isBigCommercePaymentsFastlaneMethod from './is-bigcommerce-payments-fastlane-method';

describe('isBigCommercePaymentsFastlaneMethod', () => {
    it('returns true if provided methodId is related to BigCommercePayments Fastlane', () => {
        expect(
            isBigCommercePaymentsFastlaneMethod(PaymentMethodId.BigCommercePaymentsCreditCards),
        ).toBe(true);
        expect(
            isBigCommercePaymentsFastlaneMethod(PaymentMethodId.BigCommercePaymentsFastLane),
        ).toBe(true);
    });

    it('returns false if provided methodId is not related to BigCommercePayments Fastlane', () => {
        expect(isBigCommercePaymentsFastlaneMethod(PaymentMethodId.Braintree)).toBe(false);
    });
});
