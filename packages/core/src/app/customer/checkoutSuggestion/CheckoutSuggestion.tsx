import {
    CheckoutSelectors,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { useAnalytics } from '@bigcommerce/checkout/analytics';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { PaymentMethodId } from '../../payment/paymentMethod';


import BoltCheckoutSuggestion from './BoltCheckoutSuggestion';

export interface CheckoutSuggestionProps {
    onUnhandledError?(error: Error): void;
}

export interface WithCheckoutSuggestionsProps {
    isExecutingPaymentMethodCheckout: boolean;
    providerWithCustomCheckout?: string;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    executePaymentMethodCheckout(
        options: ExecutePaymentMethodCheckoutOptions,
    ): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
}

const CheckoutSuggestion: FunctionComponent<
    WithCheckoutSuggestionsProps & CheckoutSuggestionProps
> = ({
    providerWithCustomCheckout,
    executePaymentMethodCheckout,
    ...rest
}) => {
    const { analyticsTracker } = useAnalytics();

    const handleExecutePaymentMethodCheckout = (options: ExecutePaymentMethodCheckoutOptions) => {
        analyticsTracker.customerSuggestionExecute();

        return executePaymentMethodCheckout(options);
    }

    if (providerWithCustomCheckout === PaymentMethodId.Bolt) {
        return <BoltCheckoutSuggestion
                    executePaymentMethodCheckout={handleExecutePaymentMethodCheckout}
                    methodId={providerWithCustomCheckout}
                    {...rest}
                />;
    }

    return null;
};

const mapToCheckoutSuggestionProps = ({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutSuggestionsProps | null => {
    const {
        data: { getCheckout, getConfig },
        statuses: { isExecutingPaymentMethodCheckout },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();

    if (!checkout || !config) {
        return null;
    }

    return {
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        executePaymentMethodCheckout: checkoutService.executePaymentMethodCheckout,
        initializeCustomer: checkoutService.initializeCustomer,
        isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(),
        providerWithCustomCheckout: config.checkoutSettings.providerWithCustomCheckout || undefined,
    };
};

export default withCheckout(mapToCheckoutSuggestionProps)(memo(CheckoutSuggestion));
