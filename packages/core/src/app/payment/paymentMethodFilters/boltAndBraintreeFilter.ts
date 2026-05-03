import { PaymentMethodId } from '../paymentMethod';

import { type PaymentMethodFilter } from './types';

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
