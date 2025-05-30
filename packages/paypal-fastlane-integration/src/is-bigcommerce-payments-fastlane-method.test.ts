import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isBigCommercePaymentsFastlaneMethod from './is-bigcommerce-payments-fastlane-method';

describe('isBigCommercePaymentsFastlaneMethod', () => {
    it('returns true if provided methodId is related to BigCommercePayments Fastlane', () => {
        expect(
            isBigCommercePaymentsFastlaneMethod(PaymentMethodId.PaypalCommerceCreditCards), // TODO: use BigCommercePaymentsPayLater methodId after PaymentMethodId updated
        ).toBe(true);
        expect(
            isBigCommercePaymentsFastlaneMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout), // TODO: use BigCommercePaymentsFastLane methodId after PaymentMethodId updated
        ).toBe(true);
    });

    it('returns false if provided methodId is not related to BigCommercePayments Fastlane', () => {
        expect(isBigCommercePaymentsFastlaneMethod(PaymentMethodId.Braintree)).toBe(false);
    });
});
