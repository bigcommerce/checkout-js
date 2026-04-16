import { type PaymentMethod, type PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const stripeMethodsFiltering = (
    methods: PaymentMethod[],
    paymentProviderCustomer?: PaymentProviderCustomer,
) => {
    let filteredMethods = methods;

    if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
        const stripePaymentMethod = filteredMethods.filter(
            (method) => method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE,
        );

        filteredMethods = stripePaymentMethod.length ? stripePaymentMethod : filteredMethods;
    }

    if (paymentProviderCustomer?.isCustomerCurrencySelected) {
        const stripePaymentMethod = filteredMethods.filter(
            (method) =>
                method.id === 'checkout_session' && method.gateway === PaymentMethodId.StripeOCS,
        );

        filteredMethods = stripePaymentMethod.length ? stripePaymentMethod : filteredMethods;
    }

    return filteredMethods;
};

export default stripeMethodsFiltering;
