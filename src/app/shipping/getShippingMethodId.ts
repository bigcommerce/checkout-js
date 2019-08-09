import { Checkout } from '@bigcommerce/checkout-sdk';

import getPreselectedPayment from '../payment/getPreselectedPayment';

export default function getShippingMethodId(checkout: Checkout): string | undefined {
    const SHIPPING_METHOD_IDS = ['amazon'];
    const preselectedPayment = getPreselectedPayment(checkout);

    return preselectedPayment && SHIPPING_METHOD_IDS.indexOf(preselectedPayment.providerId) > -1 ?
        preselectedPayment.providerId :
        undefined;
}
