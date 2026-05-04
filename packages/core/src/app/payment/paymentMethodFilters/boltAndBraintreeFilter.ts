import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '../paymentMethod';

export const boltAndBraintreeFilter: PaymentMethodFilter = {
    name: 'boltAndBraintree',
    apply(methods) {
        return methods.filter((method) => {
            if (method.id === PaymentMethodId.Bolt && method.initializationData) {
                return Boolean(method.initializationData.showInCheckout);
            }

            return method.id !== PaymentMethodId.BraintreeLocalPaymentMethod;
        });
    },
};
