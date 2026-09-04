import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

export const checkPaymentMethodFilter: PaymentMethodFilter = {
    name: 'checkPaymentMethodFilter',
    apply(methods, { capabilities }) {
        if (capabilities?.payment.hideCheckPaymentMethod) {
            return methods.filter((method) => method.id !== 'cheque');
        }

        return methods;
    },
};
