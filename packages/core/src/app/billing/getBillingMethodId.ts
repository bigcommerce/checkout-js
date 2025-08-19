import { type Checkout } from '@bigcommerce/checkout-sdk';

import { getPreselectedPayment } from '../payment';

export default function getBillingMethodId(checkout: Checkout): string | undefined {
    const BILLING_METHOD_IDS = ['amazonpay'];
    const preselectedPayment = getPreselectedPayment(checkout);

    return preselectedPayment && BILLING_METHOD_IDS.includes(preselectedPayment.providerId)
        ? preselectedPayment.providerId
        : undefined;
}
