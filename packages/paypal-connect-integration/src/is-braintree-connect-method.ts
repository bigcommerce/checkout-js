import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isBraintreeConnectMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.Braintree || // TODO: remove after A/B testing
        methodId === PaymentMethodId.BraintreeAcceleratedCheckout
    );
};

export default isBraintreeConnectMethod;
