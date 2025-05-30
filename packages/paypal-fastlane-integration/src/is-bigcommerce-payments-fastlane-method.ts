import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isBigCommercePaymentsFastlaneMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.PaypalCommerceCreditCards || // TODO: remove after A/B testing or use BigCommercePaymentsPayLater after PaymentMethodId updated
        methodId === PaymentMethodId.PayPalCommerceAcceleratedCheckout // TODO: use BigCommercePaymentsFastLane methodId after PaymentMethodId updated
    );
};

export default isBigCommercePaymentsFastlaneMethod;
