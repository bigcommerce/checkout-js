import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const isBigCommercePaymentsFastlaneMethod = (methodId?: string): boolean => {
    return (
        methodId === PaymentMethodId.BigCommercePaymentsPayLater || // TODO: remove after A/B testing
        methodId === PaymentMethodId.BigCommercePaymentsFastLane
    );
};

export default isBigCommercePaymentsFastlaneMethod;
