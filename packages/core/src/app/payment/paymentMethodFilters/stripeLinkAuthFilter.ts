import { PaymentMethodId } from '../paymentMethod';

import { type PaymentMethodFilter } from './types';

// TODO: In accordance with the checkout team, this functionality is temporary and will be implemented in the backend instead.
export const stripeLinkAuthFilter: PaymentMethodFilter = {
    name: 'stripeLinkAuth',
    apply(methods, { paymentProviderCustomer }) {
        if (!paymentProviderCustomer?.stripeLinkAuthenticationState) {
            return methods;
        }

        const stripeUpeMethods = methods.filter(
            (method) => method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE,
        );

        return stripeUpeMethods.length ? stripeUpeMethods : methods;
    },
};
