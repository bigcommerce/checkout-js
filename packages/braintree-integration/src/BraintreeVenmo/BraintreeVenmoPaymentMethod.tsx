import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBraintreeVenmoPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import React, { type FunctionComponent } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreeVenmoPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    language,
    method,
    paymentForm,
}) => {
    const initializeBraintreeVenmoPayment = async (options: PaymentInitializeOptions) => {
        return await checkoutService.initializePayment({
            ...options,
            integrations: [createBraintreeVenmoPaymentStrategy],
        });
    };

    return (
        <HostedPaymentComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeBraintreeVenmoPayment}
            language={language}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeVenmoPaymentMethod,
    [{ id: 'braintreevenmo' }],
);
