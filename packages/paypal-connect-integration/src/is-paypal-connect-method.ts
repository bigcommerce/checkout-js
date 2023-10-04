import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isPaypalConnectMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.Braintree ||
        methodId === PaymentMethodId.BraintreeAcceleratedCheckout
    );
};

export default isPaypalConnectMethod;
