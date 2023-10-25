import { Checkout, StoreConfig } from '@bigcommerce/checkout-sdk';

import { getPreselectedPayment } from '../payment';
import { PaymentMethodId } from '../payment/paymentMethod';

export default function getShippingMethodId(checkout: Checkout, config: StoreConfig): string | undefined {
    const SHIPPING_METHOD_IDS: string[] = [PaymentMethodId.AmazonPay, PaymentMethodId.BraintreeAcceleratedCheckout];
    const providerWithCustomCheckout = config.checkoutSettings?.providerWithCustomCheckout;
    const preselectedPayment = getPreselectedPayment(checkout);

    if (preselectedPayment && SHIPPING_METHOD_IDS.indexOf(preselectedPayment.providerId) > -1) {
        return preselectedPayment.providerId;
    }

    return providerWithCustomCheckout && SHIPPING_METHOD_IDS.indexOf(providerWithCustomCheckout) > -1
        ? providerWithCustomCheckout
        : undefined;
}
