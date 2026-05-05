import { compact, find } from 'lodash';

import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodProviderType } from '../paymentMethod';

export const selectedHostedPaymentFilter: PaymentMethodFilter = {
    name: 'selectedHostedPayment',
    apply(methods, { checkout, getPaymentMethod }) {
        const selectedPayment = checkout.payments
            ? find(checkout.payments, { providerType: PaymentMethodProviderType.Hosted })
            : undefined;

        if (!selectedPayment) {
            return methods;
        }

        const selectedPaymentMethod = getPaymentMethod(
            selectedPayment.providerId,
            selectedPayment.gatewayId,
        );

        return selectedPaymentMethod ? compact([selectedPaymentMethod]) : methods;
    },
};
