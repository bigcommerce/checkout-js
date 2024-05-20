import { PaymentMethodId } from './paymentMethod';

export default function getProviderWithCustomCheckout(methodId?: string | null): string | undefined {
    if (!methodId) {
        return undefined;
    }

    if (methodId === PaymentMethodId.PaypalCommerce) {
        return PaymentMethodId.PayPalCommerceAcceleratedCheckout;
    }

    if (methodId === PaymentMethodId.Braintree) {
        return PaymentMethodId.BraintreeAcceleratedCheckout;
    }

    return methodId;
}
