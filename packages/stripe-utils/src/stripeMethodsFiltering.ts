import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import {
    type PaymentMethodFilter,
    PaymentMethodId,
} from '@bigcommerce/checkout/payment-integration-api';

const stripeMethodsFiltering: PaymentMethodFilter = {
    name: 'stripeMethodsFiltering',
    apply(methods: PaymentMethod[], { paymentProviderCustomer }) {
        let filteredMethods = methods;

        // INFO: filtering payment methods after Stripe Link Auth
        if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
            const stripePaymentMethod = filteredMethods.filter(
                (method) => method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE,
            );

            filteredMethods = stripePaymentMethod.length ? stripePaymentMethod : filteredMethods;
        }

        // INFO: filtering payment methods after Stripe Adaptive Pricing currency switch
        if (paymentProviderCustomer?.isCustomerCurrencySelected) {
            const stripePaymentMethod = filteredMethods.filter(
                (method) =>
                    method.id === 'checkout_session' &&
                    method.gateway === PaymentMethodId.StripeOCS,
            );

            filteredMethods = stripePaymentMethod.length ? stripePaymentMethod : filteredMethods;
        }

        return filteredMethods;
    },
};

export default stripeMethodsFiltering;
