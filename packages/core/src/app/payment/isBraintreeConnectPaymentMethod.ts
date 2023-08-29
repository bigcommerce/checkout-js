import { PaymentMethodId } from './paymentMethod';

export default function isBraintreeConnectPaymentMethod(methodId?: string): boolean {
    return methodId === PaymentMethodId.Braintree || methodId === PaymentMethodId.BraintreeAcceleratedCheckout;
};
