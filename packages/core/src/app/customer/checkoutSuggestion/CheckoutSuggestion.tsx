import { CheckoutSelectors, CustomerInitializeOptions, CustomerRequestOptions, ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { PaymentMethodId } from '../../payment/paymentMethod';

import BoltCheckoutSuggestion from './BoltCheckoutSuggestion';

export interface CheckoutSuggestionProps {
    onUnhandledError?(error: Error): void;
}

export interface WithCheckoutSuggestionsProps {
    isExecutingPaymentMethodCheckout: boolean;
    providerWithCustomCheckout?: string;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    executePaymentMethodCheckout(options: ExecutePaymentMethodCheckoutOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
}

const CheckoutSuggestion: FunctionComponent<WithCheckoutSuggestionsProps & CheckoutSuggestionProps> = ({
   providerWithCustomCheckout,
   ...rest
}) => {
    if (providerWithCustomCheckout === PaymentMethodId.Bolt) {
        return <BoltCheckoutSuggestion methodId={ providerWithCustomCheckout } { ...rest } />;
    }

    return null;
};

const mapToCheckoutSuggestionProps = (
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutSuggestionsProps | null => {
    const {
        data: { getCheckout, getConfig },
        errors: {},
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
