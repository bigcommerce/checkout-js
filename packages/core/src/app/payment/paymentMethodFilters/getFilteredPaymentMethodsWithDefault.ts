import {
    type Checkout,
    type CheckoutSettings,
    type PaymentMethod,
    type PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';

import { PaymentMethodProviderType } from '../paymentMethod';

import { applyPaymentMethodFilters } from './applyPaymentMethodFilters';

export interface PaymentMethodSelectionProps {
    checkout: Checkout;
    checkoutSettings: CheckoutSettings; // this is for passing experiment flags, we don't have any experiment in filters currently.
    methods: PaymentMethod[];
    getPaymentMethod: (methodId: string, gatewayId?: string) => PaymentMethod | undefined;
    paymentProviderCustomer?: PaymentProviderCustomer;
}

export interface DefaultPaymentMethodResult {
    filteredMethods: PaymentMethod[];
    defaultMethod?: PaymentMethod;
}

const selectDefaultMethod = (
    filteredMethods: PaymentMethod[],
    checkout: Checkout,
): PaymentMethod | undefined => {
    const hasSelectedHostedPayment = checkout.payments
        ? Boolean(find(checkout.payments, { providerType: PaymentMethodProviderType.Hosted }))
        : false;

    if (hasSelectedHostedPayment) {
        return filteredMethods[0];
    }

    const methodWithDefaultStoredInstrument = find(filteredMethods, {
        config: { hasDefaultStoredInstrument: true },
    });

    return methodWithDefaultStoredInstrument || filteredMethods[0];
};

export const getFilteredPaymentMethodsWithDefault = ({
    checkout,
    checkoutSettings,
    getPaymentMethod,
    methods,
    paymentProviderCustomer,
}: PaymentMethodSelectionProps): DefaultPaymentMethodResult => {
    const filteredMethods = applyPaymentMethodFilters(methods, {
        checkout,
        checkoutSettings,
        getPaymentMethod,
        paymentProviderCustomer,
    });

    return {
        defaultMethod: selectDefaultMethod(filteredMethods, checkout),
        filteredMethods,
    };
};
