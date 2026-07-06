import React, { type FunctionComponent } from 'react';

/**
 * Placeholder billing region rendered inside the payment step under themeV2.
 *
 * CHECKOUT-10149 scaffolds the branch only — this component establishes where billing
 * will live within the payment step. The actual `BillingForm` and
 * same-as-shipping orchestration arrive in CHECKOUT-10150 / CHECKOUT-10151.
 */
export const PaymentBillingBlock: FunctionComponent = () => {
    return <div className="paymentBillingBlock" data-test="payment-billing-block" />;
};
