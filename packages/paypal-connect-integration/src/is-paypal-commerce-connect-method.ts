import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isPayPalCommerceConnectMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.PaypalCommerce || // TODO: remove after A/B testing
        methodId === PaymentMethodId.PaypalCommerceAcceleratedCheckout
    );
};

export default isPayPalCommerceConnectMethod;
