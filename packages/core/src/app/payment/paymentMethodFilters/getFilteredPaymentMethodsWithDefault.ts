import {
    type Capabilities,
    type Checkout,
    type CheckoutSettings,
    type PaymentMethod,
    type PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';

import { isExperimentEnabled } from '../../common/utility';
import { GROUPED_METHOD_ID_PREFIXES, groupPaymentMethodsByPrefix } from '../groupPaymentMethodsByPrefix';
import { PaymentMethodProviderType } from '../paymentMethod';

import { applyPaymentMethodFilters } from './applyPaymentMethodFilters';

export interface PaymentMethodSelectionProps {
    capabilities: Capabilities;
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
    capabilities,
}: PaymentMethodSelectionProps): DefaultPaymentMethodResult => {
    let filteredMethods = applyPaymentMethodFilters(methods, {
        checkout,
        checkoutSettings,
        getPaymentMethod,
        paymentProviderCustomer,
        capabilities,
    });

    const shouldGroupPaymentMethodsByPrefix = filteredMethods.some((method) =>
        GROUPED_METHOD_ID_PREFIXES.some((prefix) => method.id.startsWith(prefix)),
    );

    if (
        shouldGroupPaymentMethodsByPrefix &&
        isExperimentEnabled(checkoutSettings, 'PAYMENTS-5142.payment_method_grouping', false)
    ) {
        filteredMethods = GROUPED_METHOD_ID_PREFIXES.reduce(
            (acc, prefix) => groupPaymentMethodsByPrefix(acc, prefix),
            filteredMethods,
        );
    }

    return {
        defaultMethod: selectDefaultMethod(filteredMethods, checkout),
        filteredMethods,
    };
};
