import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

export const chequePaymentMethodFilter: PaymentMethodFilter = {
    name: 'chequePaymentMethodFilter',
    apply(methods, { checkoutSettings }) {
        // TODO
    },
};
