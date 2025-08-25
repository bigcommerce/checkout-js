import { type Checkout, type StoreConfig } from '@bigcommerce/checkout-sdk';

import { getPreselectedPayment } from '../payment';
import getProviderWithCustomCheckout from '../payment/getProviderWithCustomCheckout';
import { PaymentMethodId } from '../payment/paymentMethod';

export default function getShippingMethodId(checkout: Checkout, config: StoreConfig): string | undefined {
    const SHIPPING_METHOD_IDS: string[] = [
        PaymentMethodId.AmazonPay,
        PaymentMethodId.BraintreeAcceleratedCheckout,
        PaymentMethodId.PayPalCommerceAcceleratedCheckout,
    ];
    const providerWithCustomCheckout = getProviderWithCustomCheckout(
        config.checkoutSettings?.providerWithCustomCheckout,
    );
    const preselectedPayment = getPreselectedPayment(checkout);

    if (preselectedPayment && SHIPPING_METHOD_IDS.includes(preselectedPayment.providerId)) {
        return preselectedPayment.providerId;
    }

    return providerWithCustomCheckout && SHIPPING_METHOD_IDS.includes(providerWithCustomCheckout)
        ? providerWithCustomCheckout
        : undefined;
}
