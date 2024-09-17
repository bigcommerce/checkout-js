import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isBraintreeFastlaneMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.Braintree || // TODO: remove after A/B testing
        methodId === PaymentMethodId.BraintreeAcceleratedCheckout
    );
};

export default isBraintreeFastlaneMethod;
